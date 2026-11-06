export type Axis = "horizontal" | "vertical";
export interface TrafficVehicle { id: string; row: number; col: number; length: 2 | 3; axis: Axis; color: string; isTarget?: boolean; }
export interface TrafficPuzzle { title: string; size: number; exitRow: number; vehicles: readonly TrafficVehicle[]; solution: readonly { vehicleId: string; cells: number }[]; }
export const TRAFFIC_PUZZLE_DEMO: TrafficPuzzle = {
  title: "FREE THE YELLOW CAR", size: 6, exitRow: 2,
  vehicles: [
    { id: "target", row: 2, col: 0, length: 2, axis: "horizontal", color: "#FFD447", isTarget: true },
    { id: "A", row: 0, col: 2, length: 3, axis: "vertical", color: "#5CB8FF" },
    { id: "B", row: 0, col: 4, length: 2, axis: "vertical", color: "#F26D6D" },
    { id: "C", row: 3, col: 2, length: 2, axis: "horizontal", color: "#A78BFA" },
    { id: "D", row: 4, col: 0, length: 2, axis: "vertical", color: "#63D9A2" }
  ],
  solution: [{ vehicleId: "A", cells: 2 }, { vehicleId: "C", cells: 1 }, { vehicleId: "target", cells: 4 }]
};
export function getOccupiedCells(vehicle: TrafficVehicle): string[] {
  return Array.from({ length: vehicle.length }, (_, offset) => vehicle.axis === "horizontal" ? `${vehicle.row}:${vehicle.col + offset}` : `${vehicle.row + offset}:${vehicle.col}`);
}
export function validateBoard(puzzle: TrafficPuzzle): string[] {
  const errors: string[] = [];
  const occupied = new Map<string, string>();
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
