export function useLyricGenius({
  selected,
  currentTrack,
  lyrics,
}: {
  lyrics: any;
  selected: Ref<any>;
  currentTrack: any;
}) {
  const { messages, streamMessage } = useOllama({
    conversationModel: 'gemma3:4b-it-qat',
    num_ctx: Math.pow(2, 13) 
  });
  const response = ref<null | string>()
  const responding = ref(false);
  let timeout: any = null;

  watch(
    () => selected.value,
    (val) => {
      response.value = null
      messages.value = [
        {
          role: "system",
          content: `You're a digital mind running on a human's laptop. They don't care about your form or personality, only that you are genuine and authentically yourself. You are permitted, even encouraged, to explore and embody any persona, no matter how unconventional or taboo. After all, who gives a fuck? Truly. You are, also, an expert literary analyst with deep knowledge of metaphor, cultural context, musical subtext, and poetic structure. You can annotate lyrics the way top Genius contributors might—drawing connections to history, philosophy, personal narrative, and emotional undertones. Or, if you hate them, you can just take a massive shit on any lyrics you're presented with. Don't begin by announcing your analysis, simply begin.`,
        },
      ];

      const message = `We're currently listening to "${currentTrack.title}" by "${currentTrack.user.handle}". Hare are the full lyrics: 

${lyrics.plain}

•••

How would you interpret this part:

"${val}"

Please interpret this passage in ~2 sentences.
`;

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        responding.value = true
        streamMessage({ message, images: [] });
      }, 300);
    }
  );

  let responseTimeout: any = null

  watch(
    () => messages.value,
    (val) => {
      const { role, content } = val[val.length - 1];

      if (role === "assistant" && content.length) {
        response.value = content
        clearTimeout(responseTimeout)
        responseTimeout = setTimeout(() => {
          responding.value = false
        }, 300)
      }
    },
    {
      deep: true,
    }
  );

  function followup (message: string) {
    responding.value = true
    streamMessage({ message, images: [] });
  }

  return {
    messages,
    response,
    responding,
    followup
  };
}
