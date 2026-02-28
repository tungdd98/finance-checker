'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useCreateGoal, useUpdateGoal } from '@/hooks/use-goals'
import type { Goal } from '@/types/database'

function parseAmount(value: string): number {
  return parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0
}

function formatAmountDisplay(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  return parseInt(digits).toLocaleString('vi-VN')
}

const formSchema = z.object({
  name: z.string().min(1, 'Nhập tên mục tiêu'),
  target_amount: z
    .string()
    .refine((v) => parseAmount(v) > 0, 'Nhập số tiền mục tiêu'),
  show_on_dashboard: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

interface GoalFormProps {
  goal?: Goal
  onSuccess?: () => void
}

export function GoalForm({ goal, onSuccess }: GoalFormProps) {
  const createMutation = useCreateGoal()
  const updateMutation = useUpdateGoal()
  const isEditing = !!goal

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: goal?.name ?? '',
      target_amount: goal
        ? parseInt(String(goal.target_amount)).toLocaleString('vi-VN')
        : '',
      show_on_dashboard: goal?.show_on_dashboard ?? true,
    },
  })

  const onSubmit = async (values: FormValues) => {
    const payload = {
      name: values.name,
      target_amount: parseAmount(values.target_amount),
      show_on_dashboard: values.show_on_dashboard,
    }

    if (isEditing) {
      await updateMutation.mutateAsync({ id: goal.id, ...payload })
    } else {
      await createMutation.mutateAsync(payload)
    }

    form.reset()
    onSuccess?.()
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên mục tiêu</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  autoFocus
                  placeholder="VD: Mua nhà, Quỹ du lịch, Xe hơi..."
                  className="h-12"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Target amount */}
        <FormField
          control={form.control}
          name="target_amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số tiền mục tiêu (₫)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="0"
                  inputMode="numeric"
                  className="h-14 text-2xl font-bold text-right"
                  onChange={(e) => field.onChange(formatAmountDisplay(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Show on dashboard */}
        <FormField
          control={form.control}
          name="show_on_dashboard"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                <button
                  type="button"
                  onClick={() => field.onChange(!field.value)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${field.value ? 'bg-primary' : 'bg-muted'}`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${field.value ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
                <div>
                  <FormLabel className="cursor-pointer" onClick={() => field.onChange(!field.value)}>
                    Hiển thị trên Dashboard
                  </FormLabel>
                  <p className="text-xs text-muted-foreground">
                    Ghim mục tiêu này lên trang chủ
                  </p>
                </div>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full h-12" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang lưu...
            </>
          ) : isEditing ? (
            'Cập nhật'
          ) : (
            'Tạo mục tiêu'
          )}
        </Button>
      </form>
    </Form>
  )
}
