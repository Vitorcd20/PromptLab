import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

export const PromptForm = () => {
  return (
    <form action="" className="space-y6">
      <header className="flex flex-wrap gap-2 items-center mb-6 justify-end">
        <Button type="submit" size="sm">
          Save
        </Button>
      </header>

      <Input
        placeholder="Prompt title"
        variant="transparent"
        size="lg"
        autoFocus
      />

      <Textarea
        placeholder="Type the prompt content"
        variant="transparent"
        size="lg"
      />
    </form>
  );
};
