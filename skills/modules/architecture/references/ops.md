# Operations architecture specialization

Use this reference when the change is to **how the system runs**, not just one command.

## Required decisions

1. Who owns the run environment.
2. How the environment changes.
3. Who owns secrets and quotas.
4. What the deployment mechanism can and cannot do.
5. Which artifacts are built offline versus pulled locally.
6. How rollback is invoked.
7. What the health signal is.
8. Who owns failure escalation.

## Guidance

- A repository is not a deployment boundary until the deploy path and rollback are independent.
- Use a single runbook artifact to express environment shape, verification, rollback and escalation.
- Prefer reversible actions to reversible-but-unclear commands.
- If a route change survives rollback but a migration cannot, it is not a deployment boundary.
- Keep resources and jobs in one place, not in an ad-hoc shell list.

## Verification

For an operations change, record:

1. Environment-specific artifact.
2. Deployment invocation.
3. Verify command post-deployment.
4. Rollback invocation.
5. Monitoring or trace evidence.
6. Failure escalation owner.
7. One compensating action if the environment changes during deployment.
