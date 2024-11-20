import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { Resend } from 'https://esm.sh/@resend/node'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const { surveyId } = await req.json()

    // Get survey details with target list
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .select(`
        *,
        target_lists (
          emails
        )
      `)
      .eq('id', surveyId)
      .single()

    if (surveyError) throw surveyError

    // Send emails to each recipient
    const emails = survey.target_lists.emails
    const baseUrl = Deno.env.get('PUBLIC_URL')

    await Promise.all(
      emails.map((email) => {
        const surveyUrl = `${baseUrl}/survey/${surveyId}/respond?email=${encodeURIComponent(email)}`
        const emailBody = `${survey.email_body}\n\nPlease take our quick survey: ${surveyUrl}`

        return resend.emails.send({
          from: 'surveys@yourdomain.com',
          to: email,
          subject: survey.subject,
          text: emailBody,
        })
      })
    )

    // Update survey status to sent
    await supabase
      .from('surveys')
      .update({ status: 'sent' })
      .eq('id', surveyId)

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})