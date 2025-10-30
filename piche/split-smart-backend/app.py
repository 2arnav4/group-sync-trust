import os
from flask import Flask, request, jsonify
from flask.cli import with_appcontext
import click

from flask_migrate import Migrate
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, JWTManager
from dotenv import load_dotenv
from flask_cors import CORS

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
CORS(app)

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

# In app.py

@app.route('/api/groups/<int:group_id>/expenses', methods=['GET'])
@jwt_required()
def get_expenses(group_id):
    # ... (authentication and user check)
    expenses = Expense.query.filter_by(group_id=group_id).order_by(Expense.date.desc()).all()
    result = [
        {
            "id": exp.id,
            "description": exp.description,
            "amount": exp.total_amount,
            "date": exp.date.isoformat(),
            "paidBy": exp.payer_id,  # Ensure this is a number
            "payerName": exp.payer.name, # Add the name for display
            "category": "General", # Example category
            "isSmartContract": False,
            "participants": [{"user_id": s.user_id, "name": s.user.name, "amount": s.amount_share} for s in exp.shares]
        } for exp in expenses
    ]
    return jsonify(result)

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

# Add this new endpoint anywhere in your app.py, e.g., after create_group

@app.route('/api/groups/<int:group_id>/members', methods=['POST'])
@jwt_required()
def add_group_member(group_id):
    # Only group admin can add new members
    admin_id = int(get_jwt_identity())
    group = Group.query.get(group_id)
    if not group or group.admin_user_id != admin_id:
        return jsonify({"msg": "Access denied: Only the group admin can add members"}), 403

    data = request.get_json()
    new_user_id = data.get('user_id')

    # Check if the user to be added exists
    if not User.query.get(new_user_id):
        return jsonify({"msg": "User to be added does not exist"}), 404

    # Check if user is already a member
    if GroupMember.query.filter_by(group_id=group_id, user_id=new_user_id).first():
        return jsonify({"msg": "User is already a member of this group"}), 409

    # Add the new member
    new_membership = GroupMember(group_id=group_id, user_id=new_user_id, role=Role.MEMBER)
    db.session.add(new_membership)
    db.session.commit()

    return jsonify({"msg": f"User {new_user_id} added to group {group_id}"}), 201
