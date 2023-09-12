abstract class PathGenerator {
  abstract description: string;
  abstract count(): number;
  abstract possibleWaysStrings(): string[];
}

export default PathGenerator;
