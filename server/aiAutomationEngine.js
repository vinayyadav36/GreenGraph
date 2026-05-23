const PREMIUM_CONTENT_WEIGHT = 2.5;

export class SaasAutomationEngine {
  static generatePredictiveRunRate(dynamicLedgerHistory, trackingProjectionPeriods = 6) {
    if (!Array.isArray(dynamicLedgerHistory) || dynamicLedgerHistory.length === 0) {
      return { trendVelocity: 'STATIC', confidenceInterval: 1.0, simulationProjections: [] };
    }

    const netVelocityVector = dynamicLedgerHistory.map((snapshot) => Number(snapshot?.netBalance || 0));
    const arrayLength = netVelocityVector.length;

    let summationX = 0;
    let summationY = 0;
    let summationXY = 0;
    let summationXSquared = 0;

    for (let i = 0; i < arrayLength; i += 1) {
      summationX += i;
      summationY += netVelocityVector[i];
      summationXY += i * netVelocityVector[i];
      summationXSquared += i * i;
    }

    const denominator = arrayLength * summationXSquared - summationX * summationX;
    const growthGradientSlope =
      denominator === 0 ? 0 : (arrayLength * summationXY - summationX * summationY) / denominator;
    const baselineIntercept = (summationY - growthGradientSlope * summationX) / arrayLength;

    const simulationProjections = [];
    let runningAccumulatedBalanceModel = netVelocityVector[arrayLength - 1] || 0;

    for (let t = 1; t <= trackingProjectionPeriods; t += 1) {
      const indexStep = arrayLength + t;
      // Deterministic low-amplitude sinusoidal variance keeps projections reproducible without RNG drift.
      const stochasticVarianceFactor = Math.sin(indexStep) * 0.03;
      const projectedStepDelta = growthGradientSlope * indexStep + baselineIntercept;
      const compoundVelocityAdjusted = projectedStepDelta * (1 + stochasticVarianceFactor);
      runningAccumulatedBalanceModel += compoundVelocityAdjusted;

      simulationProjections.push({
        periodIndex: t,
        projectedDeltaVelocity: Number(compoundVelocityAdjusted.toFixed(2)),
        cumulativeReserveExpectancy: Number(runningAccumulatedBalanceModel.toFixed(2)),
      });
    }

    return {
      trendVelocity:
        growthGradientSlope > 0 ? 'EXPANSIONARY' : growthGradientSlope < 0 ? 'CONTRACTIONARY' : 'STABLE',
      linearAccelerationRate: Number(growthGradientSlope.toFixed(4)),
      simulationProjections,
    };
  }

  static categorizeMemberPersona(currentTargetMetrics, trainingPopulationDataset) {
    const targetVector = [
      Number(currentTargetMetrics?.totalSimulationsExecuted || 0),
      Number(currentTargetMetrics?.resourceDownloadsCount || 0),
      Number(currentTargetMetrics?.premiumContentGatedViews || 0) * PREMIUM_CONTENT_WEIGHT,
    ];

    const dataset = Array.isArray(trainingPopulationDataset) ? trainingPopulationDataset : [];
    if (dataset.length === 0) {
      return {
        computedCategoryClassification: 'UNDETERMINED_LOOKAHEAD',
        matchingConfidenceCoefficient: 0,
      };
    }

    const calculatedDistances = dataset.map((member) => {
      const currentCompareVector = [
        Number(member?.simulationsCount || 0),
        Number(member?.downloadsCount || 0),
        Number(member?.gatedViewsCount || 0) * PREMIUM_CONTENT_WEIGHT,
      ];

      const euclideanDistance = Math.sqrt(
        targetVector.reduce((sum, coordinateValue, index) => {
          const delta = coordinateValue - currentCompareVector[index];
          return sum + delta * delta;
        }, 0)
      );

      return {
        distance: euclideanDistance,
        taxonomyLabel: member?.assignedCategoryClassification || 'UNDETERMINED_LOOKAHEAD',
      };
    });

    calculatedDistances.sort((alpha, beta) => alpha.distance - beta.distance);
    const targetNearestNeighbors = calculatedDistances.slice(0, 3);
    const classificationFrequencyMap = {};
    targetNearestNeighbors.forEach((node) => {
      classificationFrequencyMap[node.taxonomyLabel] =
        (classificationFrequencyMap[node.taxonomyLabel] || 0) + 1;
    });

    let absoluteDominantCategory = 'UNDETERMINED_LOOKAHEAD';
    let maximumFrequencyCount = 0;

    Object.keys(classificationFrequencyMap).forEach((key) => {
      if (classificationFrequencyMap[key] > maximumFrequencyCount) {
        maximumFrequencyCount = classificationFrequencyMap[key];
        absoluteDominantCategory = key;
      }
    });

    return {
      computedCategoryClassification: absoluteDominantCategory,
      matchingConfidenceCoefficient: Number((maximumFrequencyCount / 3).toFixed(2)),
    };
  }

  static synthesizeContextualPromptPayload(profileSchemaNode, computedProjectionsBlock) {
    return {
      systemRoleConfiguration:
        'You are an automated micro-advisor operating under SALTEDHASH pipeline rules. Analyze data parameters directly.',
      injectedContextPayload: `
        [CONTEXT STATE SPECIFICATION]
        User Primary Debt Vector: ${profileSchemaNode?.declaredStudentDebt || 0}
        Target Projected Comp: ${profileSchemaNode?.targetProfessionalSalary || 0}
        Calculated Run-Rate Velocity Class: ${computedProjectionsBlock?.trendVelocity || 'STABLE'}
        Linear Acceleration Trajectory: ${computedProjectionsBlock?.linearAccelerationRate || 0}
        [SIMULATION DATA GENERATION RUNS]
        Terminal Capital Reserve Forecast: ${JSON.stringify(
          computedProjectionsBlock?.simulationProjections || []
        )}
      `
        .replace(/\s+/g, ' ')
        .trim(),
      executionInstructionDirective:
        'Provide three specific operational actions to improve this projection. Do not add conversational fluff or introductory text.',
    };
  }
}
