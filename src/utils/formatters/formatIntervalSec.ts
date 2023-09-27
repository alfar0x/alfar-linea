import addSeconds from "date-fns/addSeconds";
import formatRelative from "date-fns/formatRelative";

const formatIntervalSec = (sec: number) => {
  const now = Date.now();
  const formatted = formatRelative(addSeconds(now, sec), now);
  return `${formatted} (${sec}s)`;
};

export default formatIntervalSec;
