import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { MOCK_USERS } from '@/lib/constants';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useAppContext } from '@/contexts/AppContext';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setCurrentUser } = useAppContext();

  const handleLogin = async (mockUser: any) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: mockUser.email,
      password: mockUser.password,
    });

    if (error && error.message.includes('Invalid login credentials')) {
      // User does not exist, so sign them up
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: mockUser.email,
        password: mockUser.password,
        options: {
          data: {
            full_name: mockUser.name,
            role: mockUser.role,
          },
        },
      });

      if (signUpError) {
        toast({
          title: 'Sign-up failed',
          description: signUpError.message,
          variant: 'destructive',
        });
        return false;
      }
      
      // After sign-up, login again
      return handleLogin(mockUser);

    } else if (error) {
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
    
    // On successful Supabase login, store the mock user data and set in context
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    setCurrentUser(mockUser);
    toast({
      title: 'Login successful',
      description: `Welcome back, ${mockUser.name}!`,
    });
    navigate('/');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const mockUser = MOCK_USERS.find(user => user.email === email && user.password === password);

    if (!mockUser) {
        toast({
            title: 'Login failed',
            description: 'Invalid email or password provided.',
            variant: 'destructive',
        });
        setIsLoading(false);
        return;
    }

    await handleLogin(mockUser);
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="items-center">
        <img src="/grow_logo.png" alt="NTS G.R.O.W Logo" className="h-16 w-16 mb-4" />
        <CardTitle className="text-center text-primary">NTS G.R.O.W Admin</CardTitle>
        <CardDescription className="text-center">Sign in to access the admin platform</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ntsgrow.com"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full mt-6 bg-primary hover:bg-primary/90" 
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className="text-sm text-muted-foreground text-center">
          <p className="mb-2">Test Accounts:</p>
          <p>Super Admin: superadmin@ntsgrow.com / admin123</p>
          <p>Admin: admin@ntsgrow.com / password</p>
          <p>Agronomist: agronomist@ntsgrow.com / password</p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
