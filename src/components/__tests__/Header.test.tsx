import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Header from '../Header';
import weatherReducer, { WeatherState } from '../../redux/weatherSlice';
import '@testing-library/jest-dom/extend-expect';
import { MemoryRouter } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

jest.mock('../../hooks/useLocation', () => ({
  __esModule: true,
  default: () => ({
    location: { city: 'Test City', country: 'Test Country' },
    error: null
  })
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));

const preloadedState: { weather: WeatherState } = {
  weather: {
    cities: [],
    citySuggestions: [{ name: 'New York', country: 'USA' }],
    hourlyForecast: {},
    status: 'idle',
    error: null,
  },
};

const testStore = configureStore({
  reducer: { weather: weatherReducer },
  preloadedState,
});

const renderWithStore = (component: JSX.Element) => {
  return render(
    <Provider store={testStore}>
      <MemoryRouter>{component}</MemoryRouter>
    </Provider>
  );
};

describe('Header component', () => {
  it('renders the logo and location', () => {
    renderWithStore(<Header />);

    expect(screen.getByText('SkyCast')).toBeInTheDocument();
    expect(screen.getByText('Test City, Test Country')).toBeInTheDocument();
  });

  it('shows city suggestions and handles city selection', async () => {
    renderWithStore(<Header />);

    fireEvent.change(screen.getByPlaceholderText('Search city...'), { target: { value: 'New' } });

    await screen.findByText('New York, USA');

    fireEvent.click(screen.getByText('New York, USA'));

    expect(mockDispatch).toHaveBeenCalled();
  });

  it('handles logo click', () => {
    const navigate = useNavigate();
    renderWithStore(<Header />);

    fireEvent.click(screen.getByText('SkyCast'));

    expect(navigate).toHaveBeenCalledWith('/');
  });
});
