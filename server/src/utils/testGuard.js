function enforceDestructiveTestSafety(uri) {
  const isProduction = uri.includes('cluster0.qaloxk7.mongodb.net');
  const isAllowed = process.env.ALLOW_DESTRUCTIVE_TESTS === 'true';

  if (isProduction) {
    console.error("REFUSED: destructive test execution against production database is strictly prohibited.");
    process.exit(1);
  }

  if (!isAllowed) {
    console.error("REFUSED: destructive test execution requires explicit ALLOW_DESTRUCTIVE_TESTS=true override.");
    process.exit(1);
  }
}

module.exports = { enforceDestructiveTestSafety };
