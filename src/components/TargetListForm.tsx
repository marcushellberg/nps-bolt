import { useState } from 'react';
import { useForm } from 'react-hook-form';
import FileUploader from './FileUploader';

interface TargetListFormProps {
  onSubmit: (data: { name: string; emails: string[] }) => void;
  onCancel: () => void;
}

function TargetListForm({ onSubmit, onCancel }: TargetListFormProps) {
  const [emails, setEmails] = useState<string[]>([]);
  const { register, handleSubmit, formState: { errors } } = useForm<{ name: string }>();

  const onFormSubmit = (data: { name: string }) => {
    onSubmit({ ...data, emails });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          List Name
        </label>
        <input
          type="text"
          id="name"
          {...register('name', { required: 'Name is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Email List
        </label>
        <FileUploader onFileContent={setEmails} />
        {emails.length > 0 && (
          <p className="mt-2 text-sm text-gray-600">
            {emails.length} valid email{emails.length === 1 ? '' : 's'} found
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={emails.length === 0}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
        >
          Create List
        </button>
      </div>
    </form>
  );
}

export default TargetListForm;