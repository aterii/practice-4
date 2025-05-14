export function calculateAHP(matrix: number[][]) {
  const n = matrix.length;
  const colSums = Array(n).fill(0);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      colSums[j] += matrix[i][j];
    }
  }
  const normMatrix = matrix.map((row, i) =>
    row.map((val, j) => val / colSums[j])
  );
  const weights = normMatrix.map(row =>
    row.reduce((sum, val) => sum + val, 0) / n
  );
  const lambdaMax = matrix
    .map((row, i) =>
      row.reduce((sum, val, j) => sum + val * weights[j], 0) / weights[i]
    )
    .reduce((sum, val) => sum + val, 0) / n;
  const CI = (lambdaMax - n) / (n - 1);
  const RI = [0, 0, 0.58, 0.90, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49][n] || 1.49;
  const CR = CI / RI;
  return { weights, CR };
} 