import SidebarContent, {
  SidebarContentProps,
} from '@/components/sidebar/sidebar-content';
import { render, screen } from '@/lib/test-utils';
import userEvent from '@testing-library/user-event';

const pushMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

const initialPrompts = [
  {
    id: '1',
    title: 'Title  01',
    content: 'Content 01',
  },
];

const makeSut = (
  { prompts = initialPrompts }: SidebarContentProps = {} as SidebarContentProps
) => {
  return render(<SidebarContent prompts={prompts} />);
};

describe('SidebarContent', () => {
  const user = userEvent.setup();

  describe('base', () => {
    it('should render a button to create a new prompt', () => {
      makeSut();

      expect(screen.getByRole('complementary')).toBeVisible();
      expect(
        screen.getByRole('button', { name: 'New Prompt' })
      ).toBeInTheDocument();
    });

    it('should render the prompts list', () => {
      const input = [
        {
          id: '1',
          title: 'Example 01',
          content: 'Content 01',
        },
        {
          id: '2',
          title: 'Example 02',
          content: 'Content 02',
        },
      ];
      makeSut({ prompts: input });

      expect(screen.getByText(input[0].title)).toBeInTheDocument();
      expect(screen.getAllByRole('paragraph')).toHaveLength(input.length);
    });

    it('should render the search field as you type', async () => {
      const text = 'AI';
      makeSut();

      const searchInput = screen.getByPlaceholderText('Search prompts...');

      await user.type(searchInput, text);

      expect(searchInput).toHaveValue(text);
    });
  });

  describe('Collapse / Expand', () => {
    it('it should start expanded and display the minimize button', () => {
      makeSut();

      const aside = screen.getByRole('complementary');
      expect(aside).toBeVisible();

      const collapseButton = screen.getByRole('button', {
        name: /minimize sidebar/i,
      });

      expect(collapseButton).toBeVisible();

      const expandButton = screen.queryByRole('button', {
        name: /expand sidebar/i,
      });

      expect(expandButton).not.toBeInTheDocument();
    });

    it('should collapse and show the expand button', async () => {
      makeSut();

      const collapseButton = screen.getByRole('button', {
        name: /minimize sidebar/i,
      });

      await user.click(collapseButton);

      const expandButton = screen.queryByRole('button', {
        name: /expand sidebar/i,
      });

      expect(expandButton).toBeInTheDocument();
      expect(collapseButton).not.toBeInTheDocument();
    });
  });

  describe('New Prompt', () => {
    it('should navigate user to the new prompt page /new', async () => {
      makeSut();

      const newButton = screen.getByRole('button', { name: 'New Prompt' });

      await user.click(newButton);

      expect(pushMock).toHaveBeenCalledWith('/new');
    });
  });
});
