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

// Auth service runs in `development` so the /dev-otp helper is enabled and
// /send-otp returns the OTP in the response (mock-SMS flow). Switch to
// 'production' once MSG91 keys are configured.
function authSvc() {
  return {
    name: 'naploo-auth',
    script: BUN,
    args: `run ${CWD}/services/auth-service/src/index.ts`,
    cwd: CWD,
    env: { NODE_ENV: 'development' },
    max_restarts: 10,
    restart_delay: 2000,
  };
}

module.exports = {
  apps: [
    svc('gateway', 'api-gateway'),
    authSvc(),
    svc('booking', 'booking-service'),
    svc('hotel', 'hotel-service'),
    svc('payment', 'payment-service'),
    svc('search', 'search-service'),
    svc('notification', 'notification-service'),
    svc('investor', 'investor-service'),
    svc('referral', 'referral-service'),
    svc('rental', 'rental-service'),
    svc('analytics', 'analytics-service'),
    svc('admin', 'admin-service'),
    svc('pms', 'pms-service'),
  ],
};
