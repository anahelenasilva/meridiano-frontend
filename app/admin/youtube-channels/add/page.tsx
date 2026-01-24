'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { MESSAGES } from '@/src/constants/messages';
import { apiService } from '@/src/services/api';
import { toast } from '@/src/utils/toast';

export default function AddYoutubeChannelPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    channelId: '',
    name: '',
    url: '',
    description: '',
    enabled: true,
    maxVideos: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createChannelMutation = useMutation({
    mutationFn: (data: {
      channelId: string;
      name: string;
      url: string;
      description: string;
      enabled: boolean;
      maxVideos?: number;
    }) => apiService.createYoutubeChannel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youtube-channels'] });
      toast.success(MESSAGES.SUCCESS.CHANNEL_CREATED);
      router.push('/admin/youtube-channels');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || MESSAGES.ERROR.GENERIC;
      toast.error(`${MESSAGES.ERROR.CHANNEL_CREATE} ${errorMessage}`);

      if (errorMessage) {
        if (Array.isArray(errorMessage)) {
          const validationErrors: Record<string, string> = {};

          errorMessage.forEach((msg: string) => {
            if (msg.includes('Channel ID')) {
              validationErrors.channelId = msg;
            } else if (msg.includes('Name')) {
              validationErrors.name = msg;
            } else if (msg.includes('URL')) {
              validationErrors.url = msg;
            } else if (msg.includes('Description')) {
              validationErrors.description = msg;
            } else if (msg.includes('Max videos')) {
              validationErrors.maxVideos = msg;
            }
          });

          setErrors(validationErrors);
        }
      }
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.channelId.trim()) {
      newErrors.channelId = 'Channel ID is required';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.url.trim()) {
      newErrors.url = 'URL is required';
    } else {
      try {
        new URL(formData.url);
      } catch {
        newErrors.url = 'Invalid URL format';
      }
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.maxVideos && formData.maxVideos.trim()) {
      const maxVideosNum = parseInt(formData.maxVideos, 10);
      if (isNaN(maxVideosNum) || maxVideosNum < 1) {
        newErrors.maxVideos = 'Max videos must be at least 1';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload: {
      channelId: string;
      name: string;
      url: string;
      description: string;
      enabled: boolean;
      maxVideos?: number;
    } = {
      channelId: formData.channelId.trim(),
      name: formData.name.trim(),
      url: formData.url.trim(),
      description: formData.description.trim(),
      enabled: formData.enabled,
    };

    if (formData.maxVideos && formData.maxVideos.trim()) {
      const maxVideosNum = parseInt(formData.maxVideos, 10);
      if (!isNaN(maxVideosNum) && maxVideosNum >= 1) {
        payload.maxVideos = maxVideosNum;
      }
    }

    createChannelMutation.mutate(payload);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      enabled: e.target.checked,
    }));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/youtube-channels"
          className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Channels
        </Link>
        <div className="flex items-center space-x-3">
          <Plus className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Add YouTube Channel</h1>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Add a new YouTube channel to monitor for transcriptions.
        </p>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Channel ID */}
          <div>
            <label
              htmlFor="channelId"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Channel ID <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <input
              id="channelId"
              name="channelId"
              type="text"
              value={formData.channelId}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 ${errors.channelId ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
              placeholder="UC..."
              disabled={createChannelMutation.isPending}
            />
            {errors.channelId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.channelId}</p>
            )}
          </div>

          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Name <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 ${errors.name ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
              placeholder="Channel Name"
              disabled={createChannelMutation.isPending}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
            )}
          </div>

          {/* URL */}
          <div>
            <label
              htmlFor="url"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              URL <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <input
              id="url"
              name="url"
              type="url"
              value={formData.url}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 ${errors.url ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
              placeholder="https://youtube.com/channel/..."
              disabled={createChannelMutation.isPending}
            />
            {errors.url && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.url}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Description <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 resize-none ${errors.description ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
              placeholder="Channel description"
              disabled={createChannelMutation.isPending}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
            )}
          </div>

          {/* Enabled */}
          <div className="flex items-center">
            <input
              id="enabled"
              name="enabled"
              type="checkbox"
              checked={formData.enabled}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-blue-600 dark:text-blue-500 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              disabled={createChannelMutation.isPending}
            />
            <label
              htmlFor="enabled"
              className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Enabled
            </label>
          </div>

          {/* Max Videos */}
          <div>
            <label
              htmlFor="maxVideos"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Max Videos (Optional)
            </label>
            <input
              id="maxVideos"
              name="maxVideos"
              type="number"
              min="1"
              value={formData.maxVideos}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 ${errors.maxVideos ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
              placeholder="Leave empty to save as null (don't use this field)"
              disabled={createChannelMutation.isPending}
            />
            {errors.maxVideos && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.maxVideos}</p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Maximum number of videos to process from this channel
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/admin/youtube-channels"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={createChannelMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {createChannelMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Add Channel</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
