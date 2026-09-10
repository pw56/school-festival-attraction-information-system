export type Vector3 = [number, number, number];

export type MapVertex = {
  id: string;
  position: Vector3;
};

export type MapLine = {
  id: string;
  startVertexId: string;
  endVertexId: string;
};

export type MapCurve = {
  id: string;
  startVertexId: string;
  endVertexId: string;
  controlPoints: Vector3[];
};

export type PolyhedronEdge = {
  type: 'line' | 'curve';
  id: string;
};

export type PolyhedronFace = {
  edges: PolyhedronEdge[];
};

export type Polyhedron = {
  faces: PolyhedronFace[];
};

export type RoomLocation = {
  latitude?: number;
  longitude?: number;
};

export type Room = {
  id: string;
  eventId?: string;
  position?: Vector3;
  location?: RoomLocation;
  polyhedron: Polyhedron;
};

export type Floor = {
  id: string;
  level?: number;
  rooms: Room[];
};

export type Building = {
  id: string;
  isOutdoor: boolean;
  floors?: Floor[];
  rooms?: Room[];
};

export type Site = {
  id: string;
  buildings: Building[];
};

export type Map3DModel = {
  vertices: MapVertex[];
  lines: MapLine[];
  curves: MapCurve[];
  sites: Site[];
};

export type UpdateMapBody = {
  admin_id: string;
  map?: Map3DModel;
};

export type ErrorResponse = {
  message?: string;
};
