import { render, screen } from '@/lib/test-utils';

describe('Example', () => {
  it('should pass', () => {
    render(<div>Test</div>);

    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
