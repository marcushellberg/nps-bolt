import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { TargetList } from '../types';
import { X } from 'lucide-react';

interface SurveyFormProps {
  onSubmit: (data: {
    name: string;
    subject: string;
    email_body: string;
    target_list_id: string;
  }) => void;
  onClose: () => void;
}

function SurveyForm({ onSubmit, onClose }: SurveyFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const { data: targetLists } = useQuery({
    queryKey: ['targetLists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('target_lists')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as TargetList[];
    },
  });

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Create New Survey</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Survey Name
            </label>
            <input
              type="text"
              id="name"
              {...register('name', { required: 'Name is required' })}
              className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
              placeholder="Enter survey name"
            />
            {errors.name && (
              <p className="mt-2 text-sm text-red-600">{errors.name.message as string}</p>
            )}
          </div>

          <div>
            <label htmlFor="target_list_id" className="block text-sm font-medium text-gray-700 mb-1">
              Target List
            </label>
            <select
              id="target_list_id"
              {...register('target_list_id', { required: 'Target list is required' })}
              className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors bg-white"
            >
              <option value="">Select a target list</option>
              {targetLists?.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name} ({list.emails.length} emails)
                </option>
              ))}
            </select>
            {errors.target_list_id && (
              <p className="mt-2 text-sm text-red-600">{errors.target_list_id.message as string}</p>
            )}
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Email Subject
            </label>
            <input
              type="text"
              id="subject"
              {...register('subject', { required: 'Subject is required' })}
              className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
              placeholder="Enter email subject"
            />
            {errors.subject && (
              <p className="mt-2 text-sm text-red-600">{errors.subject.message as string}</p>
            )}
          </div>

          <div>
            <label htmlFor="email_body" className="block text-sm font-medium text-gray-700 mb-1">
              Email Body
            </label>
            <textarea
              id="email_body"
              rows={6}
              {...register('email_body', { required: 'Email body is required' })}
              className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors resize-none"
              placeholder="Write your email message here. The survey link will be automatically added at the bottom."
            />
            {errors.email_body && (
              <p className="mt-2 text-sm text-red-600">{errors.email_body.message as string}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Create Survey
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SurveyForm;