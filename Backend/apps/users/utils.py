import json
import urllib.request
import urllib.error
from decimal import Decimal
from django.core.cache import cache

class CurrencyConverter:
    API_URL = 'https://api.exchangerate-api.com/v4/latest/USD'
    CACHE_KEY = 'exchange_rates_usd'
    CACHE_TIMEOUT = 60 * 60 * 12  # 12 hours

    # Fallback rates in case the API is completely unreachable
    FALLBACK_RATES = {
        'USD': Decimal('1.0'),
        'EUR': Decimal('0.92'),
        'GBP': Decimal('0.79'),
        'INR': Decimal('83.0'),
        'JPY': Decimal('150.0'),
    }

    @classmethod
    def fetch_rates(cls):
        rates = cache.get(cls.CACHE_KEY)
        if rates:
            return rates

        try:
            req = urllib.request.Request(cls.API_URL, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=5) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode('utf-8'))
                    rates = {k: str(v) for k, v in data.get('rates', {}).items()}
                    cache.set(cls.CACHE_KEY, rates, cls.CACHE_TIMEOUT)
                    return rates
        except Exception as e:
            # Catch URLError, JSONDecodeError, etc. and fallback silently
            print(f"Failed to fetch exchange rates: {e}")
            pass
        
        return None

    @classmethod
    def get_rate(cls, currency):
        currency = currency.upper()
        if currency == 'USD':
            return Decimal('1.0')
            
        rates = cls.fetch_rates()
        if rates and currency in rates:
            return Decimal(rates[currency])
            
        return cls.FALLBACK_RATES.get(currency, Decimal('1.0'))

    @classmethod
    def to_base(cls, amount, user_currency):
        """Convert from user's currency to base currency (USD)."""
        if not amount:
            return amount
        rate = cls.get_rate(user_currency)
        return (Decimal(str(amount)) / rate).quantize(Decimal('0.01'))

    @classmethod
    def from_base(cls, amount, user_currency):
        """Convert from base currency (USD) to user's currency."""
        if not amount:
            return amount
        rate = cls.get_rate(user_currency)
        return (Decimal(str(amount)) * rate).quantize(Decimal('0.01'))
