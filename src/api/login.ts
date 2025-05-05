import api from './base';

const { get, post } = api('twilio');

export async function requestLoginCode(phone: string, method = 'sms') {
  get(`${phone}?method=${method}`);
}

export async function submitLoginCode({ sms, email }: any, code: string, validateOnly = false) {
  const { status, data } = await post(sms || email, { code, validateOnly, method: sms ? 'sms' : 'email' });

  return {
    success: status === 200,
    data: data?.error ? data.error : data,
  };
}
