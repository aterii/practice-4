import React from 'react';
import { useNavigate, Link, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
} from '@mui/material';
import { AppDispatch, RootState } from '../store';
import { logout } from '../store/slices/authSlice';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            АвтоВыбор
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            {isAuthenticated ? (
              <>
                <Typography
                  component={RouterLink}
                  to="/profile"
                  sx={{
                    color: 'white',
                    textDecoration: 'none',
                    fontWeight: 500,
                    mx: 1,
                    '&:hover': { textDecoration: 'underline', color: 'primary.light' },
                  }}
                >
                  Профиль
                </Typography>
                <Typography
                  component={RouterLink}
                  to="/car-selection"
                  sx={{
                    color: 'white',
                    textDecoration: 'none',
                    fontWeight: 500,
                    mx: 1,
                    '&:hover': { textDecoration: 'underline', color: 'primary.light' },
                  }}
                >
                  Выбор авто
                </Typography>
                <Typography
                  component={RouterLink}
                  to="/car-comparison"
                  sx={{
                    color: 'white',
                    textDecoration: 'none',
                    fontWeight: 500,
                    mx: 1,
                    '&:hover': { textDecoration: 'underline', color: 'primary.light' },
                  }}
                >
                  Сравнение
                </Typography>
                <Typography
                  component={RouterLink}
                  to="/ahp-comparison"
                  sx={{
                    color: 'white',
                    textDecoration: 'none',
                    fontWeight: 500,
                    mx: 1,
                    '&:hover': { textDecoration: 'underline', color: 'primary.light' },
                  }}
                >
                  МАИ (критерии)
                </Typography>
                <Button
                  color="inherit"
                  onClick={handleLogout}
                  sx={{
                    color: 'white',
                    fontWeight: 700,
                    ml: 2,
                    letterSpacing: 1,
                    '&:hover': { color: 'primary.light', background: 'rgba(255,255,255,0.08)' },
                  }}
                >
                  ВЫЙТИ
                </Button>
                {user && (
                  <Typography variant="body1" sx={{ alignSelf: 'center', color: 'white', ml: 2 }}>
                    {user.email}
                  </Typography>
                )}
              </>
            ) : (
              <>
                <Button color="inherit" onClick={() => navigate('/login')} sx={{ color: 'white', fontWeight: 500 }}>
                  Войти
                </Button>
                <Button color="inherit" onClick={() => navigate('/register')} sx={{ color: 'white', fontWeight: 500 }}>
                  Регистрация
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        {children}
      </Container>
      <Box component="footer" sx={{ py: 3, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © 2025 АвтоВыбор. Все права защищены.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout; 