import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button, LinearProgress, Alert } from '@mui/material';
import { RootState, AppDispatch } from '../store';
import { setMatrix, updateMatrixCell, fetchAHPComparison, saveAHPComparison } from '../store/slices/ahpSlice';

// Пример критериев (можно расширить)
const criteria = [
  'Цена',
  'Безопасность',
  'Экономичность',
  'Комфорт',
  'Вместимость',
];

// Шкала Саати (1/9 ... 1 ... 9)
const saatyscale = [9, 7, 5, 3, 1, 1/3, 1/5, 1/7, 1/9];

const AHPComparisonPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { matrix, weights, CR, status, error } = useSelector((state: RootState) => state.ahp);
  const [localMatrix, setLocalMatrix] = useState<number[][]>([]);
  const [submitted, setSubmitted] = useState(false);

  // Инициализация матрицы NxN
  useEffect(() => {
    if (!matrix.length) {
      const n = criteria.length;
      const initial = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (_, j) => (i === j ? 1 : 1))
      );
      setLocalMatrix(initial);
      dispatch(setMatrix(initial));
    } else {
      setLocalMatrix(matrix);
    }
  }, [matrix, dispatch]);

  // Обновление ячейки
  const handleCellChange = (row: number, col: number, value: number) => {
    // Ограничение: только целые числа от 1 до 9
    let val = Math.round(value);
    if (val < 1) val = 1;
    if (val > 9) val = 9;
    const updated = localMatrix.map((r, i) =>
      r.map((v, j) => {
        if (i === row && j === col) return val;
        if (i === col && j === row) return 1 / val;
        return v;
      })
    );
    setLocalMatrix(updated);
    dispatch(setMatrix(updated));
  };

  // Отправка на сервер
  const handleSubmit = () => {
    dispatch(saveAHPComparison(localMatrix));
    setSubmitted(true);
  };

  // Получение сохранённых данных
  useEffect(() => {
    dispatch(fetchAHPComparison());
  }, [dispatch]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Парные сравнения критериев (МАИ)
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Оцените относительную важность критериев по шкале Саати (только целые значения от 1 до 9). 1 — равная важность, 3 — умеренное превосходство, 5 — существенное, 7 — значительное, 9 — абсолютное. Обратные значения рассчитываются автоматически.
      </Typography>
      {status === 'loading' && <LinearProgress sx={{ mb: 2 }} />}
      {error && <Alert severity="error">{error}</Alert>}
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              {criteria.map((c, idx) => (
                <TableCell key={idx} align="center">{c}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {criteria.map((rowCrit, i) => (
              <TableRow key={i}>
                <TableCell>{rowCrit}</TableCell>
                {criteria.map((colCrit, j) => (
                  <TableCell key={j} align="center">
                    {i === j ? (
                      1
                    ) : i < j ? (
                      <TextField
                        type="number"
                        inputProps={{ min: 1, max: 9, step: 1 }}
                        value={localMatrix[i]?.[j] ?? 1}
                        onChange={e => {
                          let val = parseInt(e.target.value, 10);
                          if (isNaN(val)) val = 1;
                          handleCellChange(i, j, val);
                        }}
                        size="small"
                        sx={{ width: 70 }}
                      />
                    ) : (
                      localMatrix[i]?.[j]
                        ? (1 / localMatrix[j][i]).toFixed(3)
                        : '1'
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Button variant="contained" color="primary" onClick={handleSubmit} disabled={status === 'loading'}>
        Рассчитать веса
      </Button>
      {submitted && status === 'succeeded' && weights.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Веса критериев:</Typography>
          {criteria.map((crit, idx) => (
            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box sx={{ width: 120 }}>{crit}</Box>
              <LinearProgress variant="determinate" value={weights[idx] * 100} sx={{ flex: 1, mx: 2, height: 10, borderRadius: 5 }} />
              <Box sx={{ minWidth: 40 }}>{(weights[idx] * 100).toFixed(1)}%</Box>
            </Box>
          ))}
          <Typography sx={{ mt: 2 }}>Индекс согласованности (CR): <b>{CR !== null ? CR.toFixed(3) : '-'}</b> {CR !== null && CR < 0.1 ? '(хорошо)' : '(проверьте согласованность)'}</Typography>
          {CR !== null && CR > 0.1 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Внимание: согласованность матрицы плохая (CR {'>'} 0.1). Проверьте ваши оценки!
            </Alert>
          )}
        </Box>
      )}
    </Box>
  );
};

export default AHPComparisonPage; 