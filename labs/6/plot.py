import numpy as np
import matplotlib.pyplot as plt

initial_value = 100
years = 30

def plot(apy):
    final_values = [initial_value * ((1 + apy) ** year) for year in range(years + 1)]
    plt.plot(range(years + 1), final_values, label=f'APY: {apy:.2%}')

plt.figure(figsize=(10, 6))
for apy in [0.025, 0.03, 0.05]:
    plot(apy)
plt.title('Investment Growth Over Time')
plt.xlabel('Years')
plt.ylabel('Value')
plt.legend()
plt.savefig('investment_growth.png')