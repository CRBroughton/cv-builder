import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import App from './app.js';

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<BrowserRouter><App /></BrowserRouter>);
    expect(baseElement).toBeTruthy();
  });

  it('renders the login page at the default route', () => {
    const { getByRole } = render(<BrowserRouter><App /></BrowserRouter>);
    expect(getByRole('heading', { name: /sign in/i })).toBeTruthy();
  });
});
