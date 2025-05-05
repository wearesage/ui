const ROOT = `${import.meta.env.VITE_SERVER}/api`;
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

export default function (namespace: string = '', token: string | null = null) {
  async function request(s: string, method: 'GET' | 'PUT' | 'POST' | 'DELETE', body = null) {
    const options: any = {
      method,
      mode: 'cors',
      headers: { ...DEFAULT_HEADERS },
    };

    if (body !== null) options.body = JSON.stringify(body);
    if (token !== null) options.headers.Authorization = `Bearer ${token}`;

    try {
      const url = `${ROOT}/${namespace}${s[0] !== '?' ? '/' : ''}${s}`;
      const response = await fetch(url, options);
      
      return {
        status: response.status,
        data: method !== 'DELETE' ? await response.json() : response,
      };
    } catch (e) {
      console.log(e);
    }
  }

  function get(s: string) {
    return request(s, 'GET');
  }

  function post(s: string, data: any) {
    return request(s, 'POST', data);
  }

  function put(s: string, data: any) {
    return request(s, 'PUT', data);
  }

  function del(s: string, data: any = null) {
    return request(s, 'DELETE', data);
  }

  return {
    get,
    post,
    put,
    del,
  };
}
