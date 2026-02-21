import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/utils/toast';
import { MESSAGES } from '@/constants/messages';
import { FileText } from 'lucide-react';
import { ApiError, getErrorMessage } from '@/utils/api-error';

interface LoginPageProps {
  onLogin: () => void;
  redirectTo?: string;
}

export default function LoginPage({ onLogin, redirectTo = '/' }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(username, password);
      toast.success(MESSAGES.SUCCESS.LOGGED_IN);
      onLogin();
      navigate(redirectTo);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      
      // Check for specific error types
      if (error instanceof ApiError) {
        // Email not verified
        if (errorMessage.toLowerCase().includes('verify') || 
            errorMessage.toLowerCase().includes('email')) {
          toast.error(MESSAGES.ERROR.EMAIL_NOT_VERIFIED);
          return;
        }
        
        // Invalid credentials (wrong password)
        if (error.status === 401) {
          toast.error(MESSAGES.ERROR.LOGIN_FAILED);
          return;
        }
      }
      
      // Fallback to generic error message
      toast.error(MESSAGES.ERROR.LOGIN_FAILED);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold font-serif text-foreground">
            Meridiano
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            AI-powered summaries and insights
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-input bg-background placeholder:text-muted-foreground text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-input bg-background placeholder:text-muted-foreground text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
