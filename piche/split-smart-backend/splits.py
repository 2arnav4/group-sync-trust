from models import SplitType, Expense, ExpenseShare, User

def calculate_shares(total_amount, split_type, participants_data, group_members):
    """
    Calculates the individual shares for an expense based on the split type.
    
    :param total_amount: The total expense amount.
    :param split_type: The method of splitting (EQUAL, PERCENTAGE, CUSTOM, PREFERENCE).
    :param participants_data: Data defining how to split (e.g., percentages, custom amounts, preference tags).
    :param group_members: List of all User objects in the group.
    :return: A list of dictionaries with user_id and their calculated share.
    """
    shares = []
    
    if split_type == SplitType.EQUAL:
        num_participants = len(participants_data)
        if num_participants == 0:
            raise ValueError("At least one participant is required for an equal split.")
        share_amount = round(total_amount / num_participants, 2)
        for user_id in participants_data:
            shares.append({'user_id': user_id, 'amount': share_amount})

    elif split_type == SplitType.PERCENTAGE:
        total_percentage = sum(p['percentage'] for p in participants_data)
        if total_percentage != 100:
            raise ValueError("Percentages must add up to 100.")
        for p in participants_data:
            share_amount = round(total_amount * (p['percentage'] / 100), 2)
            shares.append({'user_id': p['user_id'], 'amount': share_amount})

    elif split_type == SplitType.CUSTOM:
        total_custom_amount = sum(p['amount'] for p in participants_data)
        if round(total_custom_amount, 2) != round(total_amount, 2):
            raise ValueError("Custom amounts must sum to the total expense amount.")
        for p in participants_data:
            shares.append({'user_id': p['user_id'], 'amount': p['amount']})
            
    elif split_type == SplitType.PREFERENCE:
        # Example: participants_data = {'type': 'food', 'tags': ['veg', 'non-drinker']}
        # This is a simplified example. A real implementation might require user profiles.
        # For this example, we'll filter based on mock preferences.
        # You would extend the User model with a preferences field (e.g., JSON)
        
        # Mock preferences for demonstration
        mock_user_preferences = {
            1: ['veg', 'non-drinker'],
            2: ['non-veg', 'drinker'],
            3: ['veg', 'drinker'],
        }

        required_tags = set(participants_data.get('tags', []))
        
        eligible_users = []
        for member in group_members:
            user_prefs = set(mock_user_preferences.get(member.id, []))
            if required_tags.issubset(user_prefs):
                eligible_users.append(member.id)
        
        if not eligible_users:
            raise ValueError("No users match the specified preferences.")
            
        share_amount = round(total_amount / len(eligible_users), 2)
        for user_id in eligible_users:
            shares.append({'user_id': user_id, 'amount': share_amount})
            
    else:
        raise ValueError(f"Invalid split type: {split_type}")

    # Verify total
    calculated_total = sum(s['amount'] for s in shares)
    if round(calculated_total, 2) != round(total_amount, 2):
        # Adjust the last share to correct for rounding errors
        diff = round(total_amount - calculated_total, 2)
        if shares:
            shares[-1]['amount'] += diff
            
    return shares


def simplify_debts(balances):
    """
    Minimizes the number of transactions required to settle all debts.
    
    :param balances: A dictionary of {user_id: net_balance}.
    :return: A list of transactions (from, to, amount).
    """
    creditors = {user: balance for user, balance in balances.items() if balance > 0}
    debtors = {user: balance for user, balance in balances.items() if balance < 0}
    
    transactions = []
    
    # Sort by amount to optimize
    sorted_creditors = sorted(creditors.items(), key=lambda item: item[1], reverse=True)
    sorted_debtors = sorted(debtors.items(), key=lambda item: item[1])
    
    cred_idx = 0
    debt_idx = 0
    
    while cred_idx < len(sorted_creditors) and debt_idx < len(sorted_debtors):
        creditor_id, creditor_balance = sorted_creditors[cred_idx]
        debtor_id, debtor_balance = sorted_debtors[debt_idx]
        
        transfer_amount = min(creditor_balance, -debtor_balance)
        
        transactions.append({
            'from': debtor_id,
            'to': creditor_id,
            'amount': round(transfer_amount, 2)
        })
        
        new_creditor_balance = creditor_balance - transfer_amount
        new_debtor_balance = debtor_balance + transfer_amount
        
        sorted_creditors[cred_idx] = (creditor_id, new_creditor_balance)
        sorted_debtors[debt_idx] = (debtor_id, new_debtor_balance)
        
        if round(new_creditor_balance, 2) == 0:
            cred_idx += 1
        if round(new_debtor_balance, 2) == 0:
            debt_idx += 1
            
    return transactions
