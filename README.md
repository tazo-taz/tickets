to run project run: skaffold dev
To run nats run: k port-forward nats-depl-776575d94c-ttbdq 4222:4222

add secret key: k create secret generic stripe-secret --from-literal STRIPE_KEY=sk_test_51NfJiaIYaEBGRyHio6hY2k7Xwz2I1ZaiEULcn5ZYXJOTB0ZmEdLR3CABqltoy0RcGxwPjKFYCNSxC9RObHmJndLi00wmwzVBq5

