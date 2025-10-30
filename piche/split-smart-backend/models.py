from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from sqlalchemy.dialects.sqlite import JSON
import enum

db = SQLAlchemy()
bcrypt = Bcrypt()

class Role(enum.Enum):
    ADMIN = "admin"
    MEMBER = "member"

class SplitType(enum.Enum):
    EQUAL = "EQUAL"
    PERCENTAGE = "PERCENTAGE"
    CUSTOM = "CUSTOM"
    PREFERENCE = "PREFERENCE"

class GroupMember(db.Model):
    __tablename__ = 'group_member'
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey('group.id'), primary_key=True)
    role = db.Column(db.Enum(Role), default=Role.MEMBER, nullable=False)
    user = db.relationship('User', back_populates='groups')
    group = db.relationship('Group', back_populates='members')

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    name = db.Column(db.String(80), nullable=False)
    
    groups = db.relationship('GroupMember', back_populates='user')
    expenses_paid = db.relationship('Expense', foreign_keys='Expense.payer_id', backref='payer', lazy=True)

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

class Group(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    admin_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    members = db.relationship('GroupMember', back_populates='group', cascade="all, delete-orphan")
    expenses = db.relationship('Expense', backref='group', lazy=True, cascade="all, delete-orphan")
    
    admin = db.relationship('User', foreign_keys=[admin_user_id])

class Expense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(200), nullable=False)
    total_amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, server_default=db.func.now())
    group_id = db.Column(db.Integer, db.ForeignKey('group.id'), nullable=False)
    payer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    split_type = db.Column(db.Enum(SplitType), nullable=False)
    # For PREFERENCE splits, stores tags like {'type': 'food', 'tags': ['non-veg', 'drinkers']}
    preference_tags = db.Column(JSON, nullable=True)
    
    shares = db.relationship('ExpenseShare', backref='expense', lazy=True, cascade="all, delete-orphan")

class ExpenseShare(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    expense_id = db.Column(db.Integer, db.ForeignKey('expense.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    amount_share = db.Column(db.Float, nullable=False)
    
    user = db.relationship('User')

