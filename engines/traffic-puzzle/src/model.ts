export type Axis = "horizontal" | "vertical";
export interface TrafficVehicle { id: string; row: number; col: number; length: 2 | 3; axis: Axis; color: string; isTarget?: boolean; }
export interface TrafficMove { vehicleId: string; cells: number; }
export interface TrafficPuzzle { title: string; size: number; exitRow: number; vehicles: readonly TrafficVehicle[]; solution: readonly TrafficMove[]; }
export const TRAFFIC_PUZZLE_DEMO: TrafficPuzzle = {
  title: "FREE THE YELLOW CAR", size: 6, exitRow: 2,
  vehicles: [
    { id: "target", row: 2, col: 0, length: 2, axis: "horizontal", color: "#FFD447", isTarget: true },
    { id: "A", row: 0, col: 2, length: 3, axis: "vertical", color: "#5CB8FF" },
    { id: "B", row: 0, col: 4, length: 2, axis: "vertical", color: "#F26D6D" },
    { id: "C", row: 3, col: 2, length: 2, axis: "horizontal", color: "#A78BFA" },
    { id: "D", row: 4, col: 0, length: 2, axis: "vertical", color: "#63D9A2" }
  ],
  solution: [{ vehicleId: "C", cells: 1 }, { vehicleId: "A", cells: 3 }, { vehicleId: "target", cells: 6 }]
};
export function getOccupiedCells(vehicle: TrafficVehicle): string[] {
  return Array.from({ length: vehicle.length }, (_, offset) => vehicle.axis === "horizontal" ? `${vehicle.row}:${vehicle.col + offset}` : `${vehicle.row + offset}:${vehicle.col}`);
}
export function validateBoard(puzzle: TrafficPuzzle): string[] {
  const errors: string[] = [];
  const occupied = new Map<string, string>();
  if (!Number.isInteger(puzzle.size) || puzzle.size < 2) errors.push("Board size must be an integer of at least 2");
  for (const vehicle of puzzle.vehicles) {
    for (const cell of getOccupiedCells(vehicle)) {
      const [rowText, colText] = cell.split(":");
      const row = Number(rowText), col = Number(colText);
      if (row < 0 || col < 0 || row >= puzzle.size || col >= puzzle.size) errors.push(`Vehicle ${vehicle.id} exceeds board bounds`);
      const previous = occupied.get(cell);
      if (previous) errors.push(`Vehicles ${previous} and ${vehicle.id} overlap at ${cell}`);
      occupied.set(cell, vehicle.id);
    }
  }
  const targets = puzzle.vehicles.filter((vehicle) => vehicle.isTarget);
  if (targets.length !== 1) errors.push("Puzzle must have exactly one target vehicle");
  if (targets[0] && (targets[0].axis !== "horizontal" || targets[0].row !== puzzle.exitRow)) errors.push("Target vehicle must be horizontal on the exit row");
  return errors;
}
export function applyTrafficMove(puzzle: TrafficPuzzle, move: TrafficMove): TrafficPuzzle {
  if (!Number.isInteger(move.cells) || move.cells === 0) throw new Error("Move distance must be a non-zero integer");
  const moving = puzzle.vehicles.find((vehicle) => vehicle.id === move.vehicleId);
  if (!moving) throw new Error(`Unknown vehicle: ${move.vehicleId}`);
  const blockers = new Set(puzzle.vehicles.filter((vehicle) => vehicle.id !== moving.id).flatMap(getOccupiedCells));
  const direction = Math.sign(move.cells);
  let current = { ...moving };
  for (let step = 0; step < Math.abs(move.cells); step++) {
    if (current.axis === "horizontal") current.col += direction;
    else current.row += direction;
    for (const cell of getOccupiedCells(current)) {
      const [rowText, colText] = cell.split(":");
      const row = Number(rowText), col = Number(colText);
      const targetExit = Boolean(moving.isTarget && moving.axis === "horizontal" && direction > 0 && moving.row === puzzle.exitRow);
      if (row < 0 || row >= puzzle.size || col < 0 || (!targetExit && col >= puzzle.size)) throw new Error(`Move for ${moving.id} exceeds board bounds`);
      if (col < puzzle.size && blockers.has(cell)) throw new Error(`Move for ${moving.id} is blocked at ${cell}`);
    }
  }
  return { ...puzzle, vehicles: puzzle.vehicles.map((vehicle) => vehicle.id === moving.id ? current : vehicle) };
}
export function validateSolution(puzzle: TrafficPuzzle): string[] {
  const errors: string[] = [];
  try {
    let state = puzzle;
    for (const move of puzzle.solution) state = applyTrafficMove(state, move);
    const target = state.vehicles.find((vehicle) => vehicle.isTarget);
    if (!target || target.col < puzzle.size) errors.push("Solution does not move the target vehicle through the exit");
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Invalid solution");
  }
  return errors;
}
