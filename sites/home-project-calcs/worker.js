const APEX = 'homeandyardcalcs.com';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === `www.${APEX}`) {
      url.hostname = APEX;
      url.protocol = 'https:';
      return new Response(null, {
        status: 301,
        headers: { Location: url.href },
      });
    }
    return env.ASSETS.fetch(request);
  },
};
