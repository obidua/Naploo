const BUN = '/home/awsclint/.bun/bin/bun';
const CWD = '/home/awsclint/Naploo';

function svc(name, file) {
  return {
    name: `naploo-${name}`,
    script: BUN,
    args: `run ${CWD}/services/${file}/src/index.ts`,
    cwd: CWD,
    env: { NODE_ENV: 'production' },
    max_restarts: 10,
    restart_delay: 2000,
  };
}

module.exports = {
  apps: [
    svc('gateway', 'api-gateway'),
    svc('auth', 'auth-service'),
    svc('booking', 'booking-service'),
    svc('hotel', 'hotel-service'),
    svc('payment', 'payment-service'),
    svc('search', 'search-service'),
    svc('notification', 'notification-service'),
  ],
};
