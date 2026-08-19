from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.accounts.models import Account
from apps.expenses.models import Expense
from apps.incomes.models import Income
from django.db.models import Sum, F
from django.utils import timezone
import calendar

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        now = timezone.now()
        current_month = now.month
        current_year = now.year

        # 1. Total Balance
        accounts = Account.objects.filter(user=user)
        total_balance = accounts.aggregate(Sum('balance'))['balance__sum'] or 0.0

        # 2. Monthly Income & Expenses
        monthly_incomes = Income.objects.filter(
            user=user, date__year=current_year, date__month=current_month
        )
        monthly_income = monthly_incomes.aggregate(Sum('amount'))['amount__sum'] or 0.0

        monthly_expenses = Expense.objects.filter(
            user=user, date__year=current_year, date__month=current_month
        )
        monthly_expense = monthly_expenses.aggregate(Sum('amount'))['amount__sum'] or 0.0

        # 3. Category Data (Current Month)
        category_totals = monthly_expenses.values(
            name=F('category__name')
        ).annotate(value=Sum('amount')).order_by('-value')
        category_data = list(category_totals)

        # 4. Recent Transactions
        recent_incomes = Income.objects.filter(user=user).select_related('category').order_by('-date', '-created_at')[:5]
        recent_expenses = Expense.objects.filter(user=user).select_related('category').order_by('-date', '-created_at')[:5]
        
        transactions = []
        for i in recent_incomes:
            transactions.append({
                'id': f'inc_{i.id}',
                'title': i.category.name if i.category else 'Income',
                'subtitle': 'Income',
                'amount': float(i.amount),
                'date': i.date.strftime('%Y-%m-%dT%H:%M:%S'),
                'type': 'income'
            })
        for e in recent_expenses:
            transactions.append({
                'id': f'exp_{e.id}',
                'title': e.category.name if e.category else 'Expense',
                'subtitle': e.payment_method,
                'amount': -float(e.amount),
                'date': e.date.strftime('%Y-%m-%dT%H:%M:%S'),
                'type': 'expense'
            })
        
        transactions.sort(key=lambda x: x['date'], reverse=True)
        recent_transactions = transactions[:5]

        # 5. Trend Data (Last 5 months)
        trend_data = []
        for i in range(4, -1, -1):
            m = (now.month - i - 1) % 12 + 1
            y = now.year + ((now.month - i - 1) // 12)
            month_name = calendar.month_abbr[m]
            
            inc = Income.objects.filter(user=user, date__year=y, date__month=m).aggregate(Sum('amount'))['amount__sum'] or 0
            exp = Expense.objects.filter(user=user, date__year=y, date__month=m).aggregate(Sum('amount'))['amount__sum'] or 0
            
            trend_data.append({
                'name': month_name,
                'Income': float(inc),
                'Expense': float(exp)
            })

        return Response({
            'totalBalance': float(total_balance),
            'monthlyIncome': float(monthly_income),
            'monthlyExpenses': float(monthly_expense),
            'categoryData': category_data,
            'recentTransactions': recent_transactions,
            'trendData': trend_data
        })
