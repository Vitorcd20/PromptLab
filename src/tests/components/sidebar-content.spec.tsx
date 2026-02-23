import SidebarContent, {
  SidebarContentProps,
} from '@/components/sidebar/sidebar-content';
import { render, screen } from '@/lib/test-utils';
import userEvent from '@testing-library/user-event';

const pushMock = jest.fn();
let mockSearchParams = new URLSearchParams();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => mockSearchParams,
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

    it('should re-expand when clicking the expand button', async () => {
      makeSut();

      const collapseButton = screen.getByRole('button', {
        name: /minimize sidebar/i,
      });

      await user.click(collapseButton);

      const expandButton = screen.getByRole('button', {
        name: /expand sidebar/i,
      });

      await user.click(expandButton);

      expect(
        screen.getByRole('button', { name: /minimize sidebar/i })
      ).toBeVisible();

      expect(
        screen.getByRole('navigation', { name: 'Prompts List' })
      ).toBeVisible();
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

    it('should display the create a new prompt button in the minimized sidebar', async () => {
      makeSut();

      const collapseButton = screen.getByRole('button', {
        name: /minimize sidebar/i,
      });

      await user.click(collapseButton);

      const newPromptButton = screen.getByRole('button', {
        name: 'New Prompt',
      });
      expect(newPromptButton).toBeVisible();
    });

    it('should not display the list of prompts in the minimized sidebar', async () => {
      makeSut();
      const collapseButton = screen.getByRole('button', {
        name: /minimize sidebar/i,
      });

      await user.click(collapseButton);

      const nav = screen.queryByRole('navigation', {
        name: 'Prompts List',
      });
      expect(nav).not.toBeInTheDocument();
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

  describe('Search', () => {
    it('should navigate using an encoded URL when the user types or clears the input', async () => {
      const text = 'A B';
      makeSut();

      const searchInput = screen.getByPlaceholderText('Search prompts...');

      await user.type(searchInput, text);

      expect(pushMock).toHaveBeenCalled();
      const lastCall = pushMock.mock.calls.at(-1);
      expect(lastCall?.[0]).toBe('/?q=A%20B');

      await user.clear(searchInput);
      const lastClearCall = pushMock.mock.calls.at(-1);
      expect(lastClearCall?.[0]).toBe('/');
    });

    it('should submit the form when typing in the search field', async () => {
      const submitSpy = jest
        .spyOn(HTMLFormElement.prototype, 'requestSubmit')
        .mockImplementation(() => undefined);
      makeSut();

      const searchInput = screen.getByPlaceholderText('Search prompts...');

      await user.type(searchInput, 'AI');

      expect(submitSpy).toHaveBeenCalled();
      submitSpy.mockRestore();
    });
  });

  it('should start the search field using the search params', () => {
    const text = 'initial';
    const searchParams = new URLSearchParams(`q=${text}`);
    mockSearchParams = searchParams;
    makeSut();

    const searchInput = screen.getByPlaceholderText('Search prompts...');

    expect(searchInput).toHaveValue(text);
  });
});
