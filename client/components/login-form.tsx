import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LoginForm() {
  return (
    <form className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          required
        />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <a
            href="#"
            className="text-muted-foreground text-xs underline-offset-2 hover:underline"
          >
            Forgot password?
          </a>
        </div>
        <Input id="password" type="password" placeholder="••••••••" required />
      </div>
      <Button type="submit" className="w-full" size="lg">
        Sign in
      </Button>
    </form>
  )
}
