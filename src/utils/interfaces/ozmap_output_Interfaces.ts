// ---------- Imputs ----------

export interface CablePathPoint {
    lat: number;
    lng: number;
}

export interface Cables {
    id: number;
    name: string;
    capacity: number;
    boxes_connected: number[];
    path: CablePathPoint[];
}

export interface Drop_Cables {
    id: number;
    name: string;
    box_id: number;
    customer_id: number;
}

export interface Boxes {
    id: number;
    name: string;
    type: string;
    lat: number;
    lng: number;
}

export interface Customers {
    id: number;
    code: string;
    name: string;
    address: string;
    box_id: number;
}

export interface InputData {
    cables: Cables[];
    drop_cables: Drop_Cables[];
    boxes: Boxes[];
    customers: Customers[];
}


// ---------- Outputs (GeoJSON) ----------

export interface Feature {
    properties: Record<string, any>;
    path?: {
        coordinates: number[] | number[][];
    }
}

export interface FeatureCollection {
    features: Feature[];
}


export type GeoJSONFeature = {
  properties: any;
  path: {
    coordinates: any;
  };
};

export type GeoJSONFeatureCollection = {
    features: GeoJSONFeature[];
};


// ---------- Transformation Function ----------

export function transformToOZmap(data: InputData): FeatureCollection {

    const features: Feature[] = []; 

    // ---- BOXES ----

    data.boxes?.forEach((box) => {
        features.push({
            properties: {
                entity: "boxes",
                id: box.id,
                name: box.name,
                type: box.type,
                lat: box.lat,
                lng: box.lng
            }
        });
    });

    // ---- CUSTOMERS ----
    data.customers.forEach((cust) => {
        features.push({
            properties: {
                entity: "customers",
                id: cust.id,
                code: cust.code,
                name: cust.name,
                address: cust.address,
                box_id: cust.box_id
            },
        });
    });

    // ---- CABLES ----
    data.cables.forEach((cable) => {
        features.push({
            properties: {
                entity: "cables",
                id: cable.id,
                name: cable.name,
                capacity: cable.capacity,
                boxes_connected: cable.boxes_connected,
            },
            path: {
                coordinates: cable.path ? cable.path.map((p) => [p.lng, p.lat]) : [],
            }
        });
    });

    // ---- DROP CABLES ----
    data.drop_cables.forEach((drop) => {
        data.customers.find((c) => c.id === drop.customer_id);

        features.push({
            properties: {
                entity: "drop_cables",
                id: drop.id,
                name: drop.name,
                box_id: drop.box_id,
                customer_id: drop.customer_id,
            },
        });

    });

    return {
        features,
    };
}