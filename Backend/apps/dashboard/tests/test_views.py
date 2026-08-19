import pytest
from rest_framework import status
from apps.expenses.models import Expense
from apps.incomes.models import Income
from apps.accounts.models import Account
from apps.categories.models import Category
from decimal import Decimal
from django.utils import timezone

@pytest.fixture
def category(user):
    return Category.objects.create(name='Food', type='expense', user=user)

@pytest.fixture
def inc_category(user):
    return Category.objects.create(name='Salary', type='income', user=user)

@pytest.mark.django_db
class TestDashboardAPI:
    def test_dashboard_success(self, authenticated_client, user, category, inc_category):
        # Create some data
        Account.objects.create(user=user, name="Bank", type="bank", balance=Decimal("1000.00"))
        now = timezone.now()
        
        Income.objects.create(user=user, amount=Decimal("2000.00"), category=inc_category, date=now)
        Expense.objects.create(user=user, amount=Decimal("150.00"), category=category, date=now, payment_method="Card")
        
        response = authenticated_client.get('/api/dashboard/')
        assert response.status_code == status.HTTP_200_OK
        
        data = response.data
        assert data['totalBalance'] == 1000.0
        assert data['monthlyIncome'] == 2000.0
        assert data['monthlyExpenses'] == 150.0
        assert len(data['categoryData']) == 1
        assert data['categoryData'][0]['name'] == 'Food'
        assert data['categoryData'][0]['value'] == 150.0
        assert len(data['recentTransactions']) == 2
        assert len(data['trendData']) == 5
