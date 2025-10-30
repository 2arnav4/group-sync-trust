import os
from flask import Flask, request, jsonify
from flask.cli import with_appcontext
import click

from flask_migrate import Migrate
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, JWTManager
from dotenv import load_dotenv

from models import db, bcrypt, User, Group, GroupMember, Role, Expense, ExpenseShare, SplitType
from splits import calculate_shares, simplify_debts

load_dotenv()

app = Flask(__name__)
app.debug = True # Keep debug mode on for development
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///splitsmart.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')

db.init_app(app)
bcrypt.init_app(app)
jwt = JWTManager(app)
migrate = Migrate(app, db)

# --- CUSTOM CLI COMMAND TO INITIALIZE DB ---
@click.command(name='init-db')
@with_appcontext
def init_db_command():
    """Clear the existing data and create new tables."""
    db.create_all()
    click.echo('Initialized the database.')

app.cli.add_command(init_db_command)


# --- AUTHENTICATION ENDPOINTS ---
@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data['email']
    name = data['name']
    password = data['password']

    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "Email already exists"}), 409

    new_user = User(email=email, name=name)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"msg": "User created successfully"}), 201

# ... (rest of the routes are unchanged - make sure they use int(get_jwt_identity()))
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    if user and user.check_password(data['password']):
        access_token = create_access_token(identity=str(user.id))
        return jsonify(access_token=access_token)
    return jsonify({"msg": "Bad email or password"}), 401

@app.route('/api/groups', methods=['POST'])
@jwt_required()
def create_group():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    new_group = Group(name=data['name'], admin_user_id=user_id)
    db.session.add(new_group)
    db.session.flush()
    membership = GroupMember(user_id=user_id, group_id=new_group.id, role=Role.ADMIN)
    db.session.add(membership)
    db.session.commit()
    return jsonify({"id": new_group.id, "name": new_group.name}), 201

# (Include all other routes here as they were before)
# --- GET USER GROUPS ---
@app.route('/api/groups', methods=['GET'])
@jwt_required()
def get_user_groups():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    groups = [{"id": gm.group.id, "name": gm.group.name} for gm in user.groups]
    return jsonify(groups)

# --- GET GROUP DETAILS ---
@app.route('/api/groups/<int:group_id>', methods=['GET'])
@jwt_required()
def get_group_details(group_id):
    user_id = int(get_jwt_identity())
    if not GroupMember.query.filter_by(group_id=group_id, user_id=user_id).first():
        return jsonify({"msg": "Access denied"}), 403
    group = Group.query.get(group_id)
    members = [{"id": gm.user.id, "name": gm.user.name} for gm in group.members]
    return jsonify({"id": group.id, "name": group.name, "members": members})

# --- ADD EXPENSE ---
@app.route('/api/groups/<int:group_id>/expenses', methods=['POST'])
@jwt_required()
def add_expense(group_id):
    user_id = int(get_jwt_identity())
    if not GroupMember.query.filter_by(group_id=group_id, user_id=user_id).first():
        return jsonify({"msg": "Access denied"}), 403
    
    data = request.get_json()
    try:
        split_type = SplitType[data['split_type'].upper()]
        total_amount = float(data['total_amount'])
        group = Group.query.get(group_id)
        
        expense = Expense(description=data['description'], total_amount=total_amount, group_id=group_id, payer_id=data['payer_id'], split_type=split_type)
        db.session.add(expense)
        
        shares_data = calculate_shares(total_amount, split_type, data['participants'], [gm.user for gm in group.members])
        for share_info in shares_data:
            share = ExpenseShare(expense=expense, user_id=share_info['user_id'], amount_share=share_info['amount'])
            db.session.add(share)
            
        db.session.commit()
        return jsonify({"msg": "Expense added"}), 201
    except (ValueError, KeyError) as e:
        db.session.rollback()
        return jsonify({"msg": str(e)}), 400

# --- GET EXPENSES ---
@app.route('/api/groups/<int:group_id>/expenses', methods=['GET'])
@jwt_required()
def get_expenses(group_id):
    user_id = int(get_jwt_identity())
    if not GroupMember.query.filter_by(group_id=group_id, user_id=user_id).first():
        return jsonify({"msg": "Access denied"}), 403
    expenses = Expense.query.filter_by(group_id=group_id).all()
    return jsonify([{"id": e.id, "description": e.description, "amount": e.total_amount} for e in expenses])

# --- GET BALANCES ---
@app.route('/api/groups/<int:group_id>/balances', methods=['GET'])
@jwt_required()
def get_balances(group_id):
    user_id = int(get_jwt_identity())
    if not GroupMember.query.filter_by(group_id=group_id, user_id=user_id).first():
        return jsonify({"msg": "Access denied"}), 403
    
    group = Group.query.get(group_id)
    balances = {member.user_id: 0.0 for member in group.members}
    for expense in group.expenses:
        balances[expense.payer_id] += expense.total_amount
        for share in expense.shares:
            balances[share.user_id] -= share.amount_share
            
    return jsonify([{"user_id": uid, "balance": round(bal, 2)} for uid, bal in balances.items()])

# --- SIMPLIFY DEBTS ---
@app.route('/api/groups/<int:group_id>/simplify', methods=['GET'])
@jwt_required()
def get_simplified_debts(group_id):
    user_id = int(get_jwt_identity())
    if not GroupMember.query.filter_by(group_id=group_id, user_id=user_id).first():
        return jsonify({"msg": "Access denied"}), 403
    
    group = Group.query.get(group_id)
    balances = {member.user_id: 0.0 for member in group.members}
    for expense in group.expenses:
        balances[expense.payer_id] += expense.total_amount
        for share in expense.shares:
            balances[share.user_id] -= share.amount_share
            
    transactions = simplify_debts(balances)
    return jsonify(transactions)

