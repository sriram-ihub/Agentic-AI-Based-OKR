import { useMutation } from "@tanstack/react-query";
import axios from "axios";

type ParsedOKR = {
  objective: string;
  deliverables: string[];
  timeline: string;
};

export const useParseOkr = () => {
  return useMutation({
    mutationFn: async (okrText: string): Promise<ParsedOKR> => {
      const res = await axios.post("http://localhost:8000/parse_okr", {
        okr_text: okrText,
      });
      return res.data.parsed;
    },
  });
};
