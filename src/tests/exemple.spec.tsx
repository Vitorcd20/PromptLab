import { render, screen } from '@/lib/test-utils';

describe('exemple', () => {
  it('should run', () => {
    render(<div>Test</div>);

    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
