import { SidebarContent } from '@/components/sidebar/sidebar-content';
import { render, screen } from '@/lib/test-utils';
import userEvent from '@testing-library/user-event';

const pushMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

const makeSut = () => {
  return render(<SidebarContent />);
};

describe('SidebarContent', () => {
  const user = userEvent.setup();

  it('should render a new prompt button', () => {
    makeSut();

    expect(screen.getByRole('complementary')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Novo prompt' })).toBeVisible();
  });

  describe('Collapse / Expand', () => {
    it('should init in expanded state and show minimize button', () => {
      makeSut();

      const aside = screen.getByRole('complementary');
      expect(aside).toBeVisible();

      const collapseButton = screen.getByRole('button', {
        name: /minimizar sidebar/i,
      });
      expect(collapseButton).toBeVisible();

      const expandButton = screen.queryByRole('button', {
        name: /expandir sidebar/i,
      });
      expect(expandButton).not.toBeInTheDocument();
    });

    it('should collapse and show expand button', async () => {
      makeSut();

      const collapseButton = screen.getByRole('button', {
        name: /minimizar sidebar/i,
      });

      await user.click(collapseButton);

      const expandButton = screen.getByRole('button', {
        name: /expandir sidebar/i,
      });
      expect(expandButton).toBeInTheDocument();

      expect(collapseButton).not.toBeInTheDocument();
    });
  });

  describe('New Prompt', () => {
    it('should navigate user to new prompt page /new', async () => {
      makeSut();

      const newButton = screen.getByRole('button', { name: 'Novo prompt' });

      await user.click(newButton);

      expect(pushMock).toHaveBeenCalledWith('/new');
    });
  });
});
