/** Visual / collision shape of the part. 'box' is the default for standard bricks. */
export type ShapeType = 'box' | 'cylinder' | 'gear' | 'custom';

export interface LegoPart {
  id: number;
  partNumber: string;
  quantity: number;
  color: string;
  partName: string;
  /** Overrides parseDimensions when the part name does not encode NxN dimensions. */
  dims?: { w: number; d: number; h: number };
  /** Determines 3D render shape; defaults to 'box'. */
  shapeType?: ShapeType;
  /** URL of an external glTF/GLB model for shapeType='custom' (future use). */
  modelUrl?: string;
}

export const legoParts: LegoPart[] = [
  {
    "id": 1,
    "partNumber": "300226",
    "quantity": 8,
    "color": "Black",
    "partName": "BRICK 2X3"
  },
  {
    "id": 2,
    "partNumber": "300426",
    "quantity": 4,
    "color": "Black",
    "partName": "BRICK 1X2"
  },
  {
    "id": 3,
    "partNumber": "4121966",
    "quantity": 4,
    "color": "Black",
    "partName": "ROOF TILE 1X2/45°"
  },
  {
    "id": 4,
    "partNumber": "4181144",
    "quantity": 2,
    "color": "Black",
    "partName": "BRICK 2X6"
  },
  {
    "id": 5,
    "partNumber": "4214559",
    "quantity": 4,
    "color": "Black",
    "partName": "BRICK 1X1 W. 2 KNOBS"
  },
  {
    "id": 6,
    "partNumber": "4521439",
    "quantity": 2,
    "color": "Black",
    "partName": "FRAME 1X2X2"
  },
  {
    "id": 7,
    "partNumber": "4548180",
    "quantity": 2,
    "color": "Black",
    "partName": "ROOF TILE 1 X 2 X 2/3, ABS"
  },
  {
    "id": 8,
    "partNumber": "4550937",
    "quantity": 2,
    "color": "Black",
    "partName": "Tyre Street Ø30.4 x 14"
  },
  {
    "id": 9,
    "partNumber": "4558957",
    "quantity": 1,
    "color": "Black",
    "partName": "BRICK 4X4 ROUND W/ Ø4.9 W/ CLICK"
  },
  {
    "id": 10,
    "partNumber": "4568644",
    "quantity": 4,
    "color": "Black",
    "partName": "TYRE NORMAL WIDE Ø21X12"
  },
  {
    "id": 11,
    "partNumber": "4644456",
    "quantity": 4,
    "color": "Black",
    "partName": "PALISADE BRICK 1X2"
  },
  {
    "id": 12,
    "partNumber": "6109682",
    "quantity": 2,
    "color": "Black",
    "partName": "RIM WIDE 18X14 W. HOLE Ø4.8"
  },
  {
    "id": 13,
    "partNumber": "6173105",
    "quantity": 2,
    "color": "Black",
    "partName": "CAVITY W. LEADS"
  },
  {
    "id": 14,
    "partNumber": "6265730",
    "quantity": 2,
    "color": "Black",
    "partName": "Plate 2x2 w. stump/top"
  },
  {
    "id": 15,
    "partNumber": "6266207",
    "quantity": 2,
    "color": "Black",
    "partName": "PLATE 1X2 W/FORK, VERTICAL"
  },
  {
    "id": 16,
    "partNumber": "6337273",
    "quantity": 1,
    "color": "Black",
    "partName": "FRAME 1X4X6"
  },
  {
    "id": 17,
    "partNumber": "6338416",
    "quantity": 2,
    "color": "Black",
    "partName": "BEARING PLATE 1X4, DOUBLE"
  },
  {
    "id": 18,
    "partNumber": "4109995",
    "quantity": 4,
    "color": "Brick Yellow",
    "partName": "BRICK 1X2"
  },
  {
    "id": 19,
    "partNumber": "4113233",
    "quantity": 2,
    "color": "Brick Yellow",
    "partName": "PLATE 1X4"
  },
  {
    "id": 20,
    "partNumber": "4113917",
    "quantity": 4,
    "color": "Brick Yellow",
    "partName": "PLATE 1X2"
  },
  {
    "id": 21,
    "partNumber": "4114084",
    "quantity": 2,
    "color": "Brick Yellow",
    "partName": "PLATE 2X2"
  },
  {
    "id": 22,
    "partNumber": "4114309",
    "quantity": 2,
    "color": "Brick Yellow",
    "partName": "PLATE 2X4"
  },
  {
    "id": 23,
    "partNumber": "4114319",
    "quantity": 2,
    "color": "Brick Yellow",
    "partName": "BRICK 2X4"
  },
  {
    "id": 24,
    "partNumber": "4118866",
    "quantity": 2,
    "color": "Brick Yellow",
    "partName": "ROOF TILE 2X2/45° INV."
  },
  {
    "id": 25,
    "partNumber": "4121972",
    "quantity": 4,
    "color": "Brick Yellow",
    "partName": "ROOF TILE 1X2/45°"
  },
  {
    "id": 26,
    "partNumber": "4162465",
    "quantity": 4,
    "color": "Brick Yellow",
    "partName": "BRICK 1X3"
  },
  {
    "id": 27,
    "partNumber": "4201062",
    "quantity": 2,
    "color": "Brick Yellow",
    "partName": "BRICK 1X4 W. 4 KNOBS"
  },
  {
    "id": 28,
    "partNumber": "4624088",
    "quantity": 2,
    "color": "Brick Yellow",
    "partName": "BRICK W/BOW 1/3"
  },
  {
    "id": 29,
    "partNumber": "6034929",
    "quantity": 2,
    "color": "Brick Yellow",
    "partName": "FRAME 1X2X3"
  },
  {
    "id": 30,
    "partNumber": "6411329",
    "quantity": 4,
    "color": "Brick Yellow",
    "partName": "BRICK 1X1X1 1/3, W/ ARCH"
  },
  {
    "id": 31,
    "partNumber": "6468347",
    "quantity": 2,
    "color": "Brick Yellow",
    "partName": "FRAME 1X2X3"
  },
  {
    "id": 32,
    "partNumber": "300123",
    "quantity": 6,
    "color": "Bright Blue",
    "partName": "BRICK 2X4"
  },
  {
    "id": 33,
    "partNumber": "300223",
    "quantity": 4,
    "color": "Bright Blue",
    "partName": "BRICK 2X3"
  },
  {
    "id": 34,
    "partNumber": "300323",
    "quantity": 4,
    "color": "Bright Blue",
    "partName": "BRICK 2X2"
  },
  {
    "id": 35,
    "partNumber": "303923",
    "quantity": 4,
    "color": "Bright Blue",
    "partName": "ROOF TILE 2X2/45°"
  },
  {
    "id": 36,
    "partNumber": "368023",
    "quantity": 2,
    "color": "Bright Blue",
    "partName": "TURN PLATE 2X2, LOWER PART"
  },
  {
    "id": 37,
    "partNumber": "371023",
    "quantity": 4,
    "color": "Bright Blue",
    "partName": "PLATE 1X4"
  },
  {
    "id": 38,
    "partNumber": "4166140",
    "quantity": 2,
    "color": "Bright Blue",
    "partName": "WHIP/AERIAL"
  },
  {
    "id": 39,
    "partNumber": "4212411",
    "quantity": 2,
    "color": "Bright Blue",
    "partName": "BRICK 1X4 W. 4 KNOBS"
  },
  {
    "id": 40,
    "partNumber": "4243815",
    "quantity": 3,
    "color": "Bright Blue",
    "partName": "PLATE 4X4"
  },
  {
    "id": 41,
    "partNumber": "6092663",
    "quantity": 1,
    "color": "Bright Blue",
    "partName": "NOSE CONE 2X2X2"
  },
  {
    "id": 42,
    "partNumber": "6281991",
    "quantity": 4,
    "color": "Bright Blue",
    "partName": "LAMP HOLDER"
  },
  {
    "id": 43,
    "partNumber": "4143562",
    "quantity": 3,
    "color": "Bright Green",
    "partName": "FLOWER, STALK"
  },
  {
    "id": 44,
    "partNumber": "4541414",
    "quantity": 1,
    "color": "Bright Green",
    "partName": "PLATE 6X12"
  },
  {
    "id": 45,
    "partNumber": "4611777",
    "quantity": 1,
    "color": "Bright Green",
    "partName": "PLATE 16X16"
  },
  {
    "id": 46,
    "partNumber": "4617799",
    "quantity": 1,
    "color": "Bright Green",
    "partName": "PLATE 4X4"
  },
  {
    "id": 47,
    "partNumber": "4647553",
    "quantity": 4,
    "color": "Bright Green",
    "partName": "BRICK 1X2"
  },
  {
    "id": 48,
    "partNumber": "6102903",
    "quantity": 2,
    "color": "Bright Green",
    "partName": "BRICK 2X6"
  },
  {
    "id": 49,
    "partNumber": "6170300",
    "quantity": 3,
    "color": "Bright Green",
    "partName": "BRACELET UPPER PART"
  },
  {
    "id": 50,
    "partNumber": "4118782",
    "quantity": 2,
    "color": "Bright Orange",
    "partName": "PLATE 1X4"
  },
  {
    "id": 51,
    "partNumber": "4118827",
    "quantity": 4,
    "color": "Bright Orange",
    "partName": "BRICK 1X4"
  },
  {
    "id": 52,
    "partNumber": "4121739",
    "quantity": 12,
    "color": "Bright Orange",
    "partName": "BRICK 1X2"
  },
  {
    "id": 53,
    "partNumber": "4153825",
    "quantity": 4,
    "color": "Bright Orange",
    "partName": "BRICK 2X2"
  },
  {
    "id": 54,
    "partNumber": "4153827",
    "quantity": 2,
    "color": "Bright Orange",
    "partName": "BRICK 2X4"
  },
  {
    "id": 55,
    "partNumber": "4177932",
    "quantity": 2,
    "color": "Bright Orange",
    "partName": "PLATE 1X2"
  },
  {
    "id": 56,
    "partNumber": "6240515",
    "quantity": 1,
    "color": "Bright Orange",
    "partName": "ELEMENT SEPARATOR"
  },
  {
    "id": 57,
    "partNumber": "4517992",
    "quantity": 4,
    "color": "Bright Purple",
    "partName": "BRICK 2X2"
  },
  {
    "id": 58,
    "partNumber": "6127601",
    "quantity": 3,
    "color": "Bright Purple",
    "partName": "ROOF TILE 1X1X2/3, ABS"
  },
  {
    "id": 59,
    "partNumber": "6170298",
    "quantity": 3,
    "color": "Bright Purple",
    "partName": "BRACELET UPPER PART"
  },
  {
    "id": 60,
    "partNumber": "300121",
    "quantity": 8,
    "color": "Bright Red",
    "partName": "BRICK 2X4"
  },
  {
    "id": 61,
    "partNumber": "300321",
    "quantity": 4,
    "color": "Bright Red",
    "partName": "BRICK 2X2"
  },
  {
    "id": 62,
    "partNumber": "300421",
    "quantity": 8,
    "color": "Bright Red",
    "partName": "BRICK 1X2"
  },
  {
    "id": 63,
    "partNumber": "300921",
    "quantity": 2,
    "color": "Bright Red",
    "partName": "BRICK 1X6"
  },
  {
    "id": 64,
    "partNumber": "365921",
    "quantity": 4,
    "color": "Bright Red",
    "partName": "BRICK W. BOW 1X4"
  },
  {
    "id": 65,
    "partNumber": "614121",
    "quantity": 3,
    "color": "Bright Red",
    "partName": "ROUND PLATE 1X1"
  },
  {
    "id": 66,
    "partNumber": "4504379",
    "quantity": 3,
    "color": "Bright Red",
    "partName": "ROOF TILE 1X1X2/3, ABS"
  },
  {
    "id": 67,
    "partNumber": "4515371",
    "quantity": 4,
    "color": "Bright Red",
    "partName": "ROOF TILE 2X1X2"
  },
  {
    "id": 68,
    "partNumber": "4521852",
    "quantity": 2,
    "color": "Bright Red",
    "partName": "BRICK 2X2 W. BOW AND KNOBS"
  },
  {
    "id": 69,
    "partNumber": "4528164",
    "quantity": 2,
    "color": "Bright Red",
    "partName": "FRAME 2X4X3"
  },
  {
    "id": 70,
    "partNumber": "4651524",
    "quantity": 4,
    "color": "Bright Red",
    "partName": "ROOF TILE 1 X 2 X 2/3, ABS"
  },
  {
    "id": 71,
    "partNumber": "6030266",
    "quantity": 2,
    "color": "Bright Red",
    "partName": "BRICK 1X1 W. 2 KNOBS"
  },
  {
    "id": 72,
    "partNumber": "6184782",
    "quantity": 2,
    "color": "Bright Red",
    "partName": "BRICK 1X1X1 1/3, W/ ARCH"
  },
  {
    "id": 73,
    "partNumber": "4518889",
    "quantity": 4,
    "color": "Bright Reddish Violet",
    "partName": "ROOF TILE 2X4/45°"
  },
  {
    "id": 74,
    "partNumber": "4550362",
    "quantity": 8,
    "color": "Bright Reddish Violet",
    "partName": "ROOF TILE 2X2/45°"
  },
  {
    "id": 75,
    "partNumber": "4625626",
    "quantity": 4,
    "color": "Bright Reddish Violet",
    "partName": "ROOF TILE 1X2/45°"
  },
  {
    "id": 76,
    "partNumber": "6022035",
    "quantity": 4,
    "color": "Bright Reddish Violet",
    "partName": "BRICK 1X1"
  },
  {
    "id": 77,
    "partNumber": "6037652",
    "quantity": 2,
    "color": "Bright Reddish Violet",
    "partName": "PLATE 1X4"
  },
  {
    "id": 78,
    "partNumber": "300124",
    "quantity": 4,
    "color": "Bright Yellow",
    "partName": "BRICK 2X4"
  },
  {
    "id": 79,
    "partNumber": "300324",
    "quantity": 4,
    "color": "Bright Yellow",
    "partName": "BRICK 2X2"
  },
  {
    "id": 80,
    "partNumber": "300524",
    "quantity": 4,
    "color": "Bright Yellow",
    "partName": "BRICK 1X1"
  },
  {
    "id": 81,
    "partNumber": "303224",
    "quantity": 1,
    "color": "Bright Yellow",
    "partName": "PLATE 4X6"
  },
  {
    "id": 82,
    "partNumber": "4170460",
    "quantity": 4,
    "color": "Bright Yellow",
    "partName": "RIM WIDE W. HOLE Ø11"
  },
  {
    "id": 83,
    "partNumber": "4204625",
    "quantity": 4,
    "color": "Bright Yellow",
    "partName": "BRICK W. BOW 4X1X1 1/3"
  },
  {
    "id": 84,
    "partNumber": "4219911",
    "quantity": 4,
    "color": "Bright Yellow",
    "partName": "ROOF TILE 2X4/45°"
  },
  {
    "id": 85,
    "partNumber": "4514844",
    "quantity": 1,
    "color": "Bright Yellow",
    "partName": "PLATE 1X12"
  },
  {
    "id": 86,
    "partNumber": "4528550",
    "quantity": 1,
    "color": "Bright Yellow",
    "partName": "D. W. PANES F. FRAME 1X4X6"
  },
  {
    "id": 87,
    "partNumber": "4613151",
    "quantity": 2,
    "color": "Bright Yellow",
    "partName": "PLATE W. BOW 1X4X2/3"
  },
  {
    "id": 88,
    "partNumber": "6000022",
    "quantity": 2,
    "color": "Bright Yellow",
    "partName": "FLOWER"
  },
  {
    "id": 89,
    "partNumber": "6171059",
    "quantity": 4,
    "color": "Bright Yellow",
    "partName": "WINDOW ½ FOR FRAME 1X4X3"
  },
  {
    "id": 90,
    "partNumber": "6267090",
    "quantity": 2,
    "color": "Bright Yellow",
    "partName": "BRICK 1X4 FRIC/STUB/FORK VERT."
  },
  {
    "id": 91,
    "partNumber": "4164022",
    "quantity": 4,
    "color": "Bright Yellowish Green",
    "partName": "BRICK 1X2"
  },
  {
    "id": 92,
    "partNumber": "4165967",
    "quantity": 6,
    "color": "Bright Yellowish Green",
    "partName": "BRICK 2X4"
  },
  {
    "id": 93,
    "partNumber": "4220631",
    "quantity": 4,
    "color": "Bright Yellowish Green",
    "partName": "BRICK 2X3"
  },
  {
    "id": 94,
    "partNumber": "4220632",
    "quantity": 4,
    "color": "Bright Yellowish Green",
    "partName": "BRICK 2X2"
  },
  {
    "id": 95,
    "partNumber": "4220634",
    "quantity": 8,
    "color": "Bright Yellowish Green",
    "partName": "BRICK 1X1"
  },
  {
    "id": 96,
    "partNumber": "4518611",
    "quantity": 4,
    "color": "Bright Yellowish Green",
    "partName": "FLAT TILE 2X2"
  },
  {
    "id": 97,
    "partNumber": "4529679",
    "quantity": 4,
    "color": "Bright Yellowish Green",
    "partName": "ROOF TILE 2X2/45 INV."
  },
  {
    "id": 98,
    "partNumber": "4650630",
    "quantity": 4,
    "color": "Bright Yellowish Green",
    "partName": "ROOF TILE 2X2/45°"
  },
  {
    "id": 99,
    "partNumber": "6022083",
    "quantity": 8,
    "color": "Cool Yellow",
    "partName": "BRICK 1X2"
  },
  {
    "id": 100,
    "partNumber": "6036232",
    "quantity": 8,
    "color": "Cool Yellow",
    "partName": "BRICK 1X4"
  },
  {
    "id": 101,
    "partNumber": "4653988",
    "quantity": 4,
    "color": "Dark Azur",
    "partName": "PLATE 1X2"
  },
  {
    "id": 102,
    "partNumber": "4655172",
    "quantity": 4,
    "color": "Dark Azur",
    "partName": "BRICK 2X4"
  },
  {
    "id": 103,
    "partNumber": "6004943",
    "quantity": 8,
    "color": "Dark Azur",
    "partName": "BRICK 1X2"
  },
  {
    "id": 104,
    "partNumber": "243128",
    "quantity": 2,
    "color": "Dark Green",
    "partName": "FLAT TILE 1X4"
  },
  {
    "id": 105,
    "partNumber": "300328",
    "quantity": 4,
    "color": "Dark Green",
    "partName": "BRICK 2X2"
  },
  {
    "id": 106,
    "partNumber": "302128",
    "quantity": 2,
    "color": "Dark Green",
    "partName": "PLATE 2X3"
  },
  {
    "id": 107,
    "partNumber": "303928",
    "quantity": 4,
    "color": "Dark Green",
    "partName": "ROOF TILE 2X2/45°"
  },
  {
    "id": 108,
    "partNumber": "4106356",
    "quantity": 4,
    "color": "Dark Green",
    "partName": "BRICK 2X4"
  },
  {
    "id": 109,
    "partNumber": "4121969",
    "quantity": 4,
    "color": "Dark Green",
    "partName": "ROOF TILE 1X2/45°"
  },
  {
    "id": 110,
    "partNumber": "4187334",
    "quantity": 4,
    "color": "Dark Green",
    "partName": "ANGULAR BRICK 1X1"
  },
  {
    "id": 111,
    "partNumber": "6000071",
    "quantity": 4,
    "color": "Dark Green",
    "partName": "ROOF TILE 1 X 2 X 2/3, ABS"
  },
  {
    "id": 112,
    "partNumber": "6037389",
    "quantity": 2,
    "color": "Dark Green",
    "partName": "ROOF TILE 1X3/25° INV."
  },
  {
    "id": 113,
    "partNumber": "4666352",
    "quantity": 8,
    "color": "Dark Orange",
    "partName": "PALISADE BRICK 1X2"
  },
  {
    "id": 114,
    "partNumber": "6000743",
    "quantity": 2,
    "color": "Dark Orange",
    "partName": "BRICK 1X6"
  },
  {
    "id": 115,
    "partNumber": "6074890",
    "quantity": 4,
    "color": "Dark Orange",
    "partName": "ROUND BRICK 1X1"
  },
  {
    "id": 116,
    "partNumber": "4210633",
    "quantity": 2,
    "color": "Dark Stone Grey",
    "partName": "ROUND PLATE 1X1"
  },
  {
    "id": 117,
    "partNumber": "4210706",
    "quantity": 1,
    "color": "Dark Stone Grey",
    "partName": "PLATE 4X12"
  },
  {
    "id": 118,
    "partNumber": "4210862",
    "quantity": 4,
    "color": "Dark Stone Grey",
    "partName": "ROOF TILE CORN. INVERT.2X2/45°"
  },
  {
    "id": 119,
    "partNumber": "4211085",
    "quantity": 3,
    "color": "Dark Stone Grey",
    "partName": "BRICK 2X4"
  },
  {
    "id": 120,
    "partNumber": "4211088",
    "quantity": 4,
    "color": "Dark Stone Grey",
    "partName": "BRICK 1X2"
  },
  {
    "id": 121,
    "partNumber": "6039176",
    "quantity": 2,
    "color": "Dark Stone Grey",
    "partName": "PLATE 3X3"
  },
  {
    "id": 122,
    "partNumber": "6056296",
    "quantity": 2,
    "color": "Dark Stone Grey",
    "partName": "FLAT TILE 2X2, ROUND"
  },
  {
    "id": 123,
    "partNumber": "4249891",
    "quantity": 16,
    "color": "Earth Blue",
    "partName": "BRICK 1X2"
  },
  {
    "id": 124,
    "partNumber": "4245570",
    "quantity": 8,
    "color": "Earth Green",
    "partName": "BRICK 1X2"
  },
  {
    "id": 125,
    "partNumber": "4260493",
    "quantity": 4,
    "color": "Earth Green",
    "partName": "BRICK 2X4"
  },
  {
    "id": 126,
    "partNumber": "6003331",
    "quantity": 4,
    "color": "Earth Green",
    "partName": "ROOF TILE 2X1X2"
  },
  {
    "id": 127,
    "partNumber": "6020181",
    "quantity": 4,
    "color": "Flame Yellowish Orange",
    "partName": "ROOF TILE 2X2/45°"
  },
  {
    "id": 128,
    "partNumber": "6100027",
    "quantity": 4,
    "color": "Flame Yellowish Orange",
    "partName": "BRICK 2X4"
  },
  {
    "id": 129,
    "partNumber": "6170304",
    "quantity": 3,
    "color": "Flame Yellowish Orange",
    "partName": "BRACELET UPPER PART"
  },
  {
    "id": 130,
    "partNumber": "4286050",
    "quantity": 6,
    "color": "Light Purple",
    "partName": "BRICK 1X1"
  },
  {
    "id": 131,
    "partNumber": "4517993",
    "quantity": 8,
    "color": "Light Purple",
    "partName": "BRICK 1X2"
  },
  {
    "id": 132,
    "partNumber": "4518890",
    "quantity": 4,
    "color": "Light Purple",
    "partName": "BRICK 1X4"
  },
  {
    "id": 133,
    "partNumber": "4520632",
    "quantity": 4,
    "color": "Light Purple",
    "partName": "BRICK 2X4"
  },
  {
    "id": 134,
    "partNumber": "4550359",
    "quantity": 8,
    "color": "Light Purple",
    "partName": "BRICK 2X2"
  },
  {
    "id": 135,
    "partNumber": "4619520",
    "quantity": 3,
    "color": "Medium Azur",
    "partName": "ROOF TILE 1X1X2/3, ABS"
  },
  {
    "id": 136,
    "partNumber": "4619655",
    "quantity": 8,
    "color": "Medium Azur",
    "partName": "ROOF TILE 1X2/45°"
  },
  {
    "id": 137,
    "partNumber": "4625036",
    "quantity": 2,
    "color": "Medium Azur",
    "partName": "PLATE 1X6"
  },
  {
    "id": 138,
    "partNumber": "4625629",
    "quantity": 4,
    "color": "Medium Azur",
    "partName": "BRICK 2X4"
  },
  {
    "id": 139,
    "partNumber": "4653970",
    "quantity": 4,
    "color": "Medium Azur",
    "partName": "BRICK 2X2"
  },
  {
    "id": 140,
    "partNumber": "4655256",
    "quantity": 4,
    "color": "Medium Azur",
    "partName": "PLATE 2X4"
  },
  {
    "id": 141,
    "partNumber": "6035598",
    "quantity": 4,
    "color": "Medium Azur",
    "partName": "BRICK W/BOW 1/3"
  },
  {
    "id": 142,
    "partNumber": "6036238",
    "quantity": 4,
    "color": "Medium Azur",
    "partName": "BRICK 1X4"
  },
  {
    "id": 143,
    "partNumber": "6036493",
    "quantity": 4,
    "color": "Medium Azur",
    "partName": "CORNER BRICK 2X2/45° OUTSIDE"
  },
  {
    "id": 144,
    "partNumber": "6070756",
    "quantity": 4,
    "color": "Medium Azur",
    "partName": "ROOF TILE 2X2/45 INV."
  },
  {
    "id": 145,
    "partNumber": "6070769",
    "quantity": 4,
    "color": "Medium Azur",
    "partName": "ROOF TILE 1X2 INV."
  },
  {
    "id": 146,
    "partNumber": "6074793",
    "quantity": 2,
    "color": "Medium Azur",
    "partName": "PLATE 1X8"
  },
  {
    "id": 147,
    "partNumber": "6092674",
    "quantity": 4,
    "color": "Medium Azur",
    "partName": "BRICK 1X2"
  },
  {
    "id": 148,
    "partNumber": "6097093",
    "quantity": 4,
    "color": "Medium Azur",
    "partName": "PLATE W. BOW 1X4X2/3"
  },
  {
    "id": 149,
    "partNumber": "4651903",
    "quantity": 6,
    "color": "Medium Lavender",
    "partName": "BRICK 1X1"
  },
  {
    "id": 150,
    "partNumber": "6022023",
    "quantity": 4,
    "color": "Medium Lavender",
    "partName": "ROOF TILE 2X2/45°"
  },
  {
    "id": 151,
    "partNumber": "6102516",
    "quantity": 2,
    "color": "Medium Lavender",
    "partName": "PLATE 3X3, CROSS"
  },
  {
    "id": 152,
    "partNumber": "4566522",
    "quantity": 3,
    "color": "Medium Lilac",
    "partName": "PLATE 1X1 ROUND"
  },
  {
    "id": 153,
    "partNumber": "4566607",
    "quantity": 4,
    "color": "Medium Lilac",
    "partName": "ROOF TILE 1 X 2 X 2/3, ABS"
  },
  {
    "id": 154,
    "partNumber": "4622176",
    "quantity": 4,
    "color": "Medium Lilac",
    "partName": "BRICK Ø16 W. CROSS"
  },
  {
    "id": 155,
    "partNumber": "4626935",
    "quantity": 4,
    "color": "Medium Lilac",
    "partName": "BRICK 2X4"
  },
  {
    "id": 156,
    "partNumber": "4653960",
    "quantity": 4,
    "color": "Medium Lilac",
    "partName": "BRICK 2X2"
  },
  {
    "id": 157,
    "partNumber": "6022070",
    "quantity": 4,
    "color": "Medium Lilac",
    "partName": "ROOF TILE 2X1X2"
  },
  {
    "id": 158,
    "partNumber": "4569382",
    "quantity": 8,
    "color": "Medium Nougat",
    "partName": "BRICK 1X2"
  },
  {
    "id": 159,
    "partNumber": "6057986",
    "quantity": 8,
    "color": "Medium Nougat",
    "partName": "BRICK 1X1"
  },
  {
    "id": 160,
    "partNumber": "6058085",
    "quantity": 8,
    "color": "Medium Nougat",
    "partName": "BRICK 2X2"
  },
  {
    "id": 161,
    "partNumber": "6058135",
    "quantity": 2,
    "color": "Medium Nougat",
    "partName": "ROOF TILE 1X2/45°"
  },
  {
    "id": 162,
    "partNumber": "4211356",
    "quantity": 2,
    "color": "Medium Stone Grey",
    "partName": "FLAT TILE 1X4"
  },
  {
    "id": 163,
    "partNumber": "4211385",
    "quantity": 4,
    "color": "Medium Stone Grey",
    "partName": "BRICK 2X4"
  },
  {
    "id": 164,
    "partNumber": "4211388",
    "quantity": 8,
    "color": "Medium Stone Grey",
    "partName": "BRICK 1X2"
  },
  {
    "id": 165,
    "partNumber": "4211389",
    "quantity": 4,
    "color": "Medium Stone Grey",
    "partName": "BRICK 1X1"
  },
  {
    "id": 166,
    "partNumber": "4211394",
    "quantity": 4,
    "color": "Medium Stone Grey",
    "partName": "BRICK 1X4"
  },
  {
    "id": 167,
    "partNumber": "4211406",
    "quantity": 2,
    "color": "Medium Stone Grey",
    "partName": "PLATE 2X8"
  },
  {
    "id": 168,
    "partNumber": "4211473",
    "quantity": 1,
    "color": "Medium Stone Grey",
    "partName": "WHIP/AERIAL"
  },
  {
    "id": 169,
    "partNumber": "4211564",
    "quantity": 8,
    "color": "Medium Stone Grey",
    "partName": "BRICK 1X2X2"
  },
  {
    "id": 170,
    "partNumber": "4540203",
    "quantity": 2,
    "color": "Medium Stone Grey",
    "partName": "TURN PLATE 2X2, UPPER PART"
  },
  {
    "id": 171,
    "partNumber": "4560183",
    "quantity": 4,
    "color": "Medium Stone Grey",
    "partName": "FLAT TILE 2X4"
  },
  {
    "id": 172,
    "partNumber": "4567448",
    "quantity": 4,
    "color": "Medium Stone Grey",
    "partName": "BRICK 2X2W.INSIDE AND OUTS.BOW"
  },
  {
    "id": 173,
    "partNumber": "4610149",
    "quantity": 1,
    "color": "Medium Stone Grey",
    "partName": "LATTICE DOOR FOR FRAME 1X4X6"
  },
  {
    "id": 174,
    "partNumber": "4642934",
    "quantity": 2,
    "color": "Medium Stone Grey",
    "partName": "WALL 1X2X2 W. BOWED SLIT"
  },
  {
    "id": 175,
    "partNumber": "4654577",
    "quantity": 1,
    "color": "Medium Stone Grey",
    "partName": "PLATE 2X2X2/3 W. 2. HOR. KNOB"
  },
  {
    "id": 176,
    "partNumber": "6106189",
    "quantity": 1,
    "color": "Medium Stone Grey",
    "partName": "BRICK W. INSIDE BOW 1X6X2"
  },
  {
    "id": 177,
    "partNumber": "6335378",
    "quantity": 1,
    "color": "Medium Stone Grey",
    "partName": "PLATE 1X1 W/HOLDER VERTICAL"
  },
  {
    "id": 178,
    "partNumber": "6321769",
    "quantity": 4,
    "color": "Multicombination",
    "partName": "BRICK 1X2 W. HORIZONTAL SNAP"
  },
  {
    "id": 179,
    "partNumber": "6347698",
    "quantity": 2,
    "color": "Multicombination",
    "partName": "BRICK 2X2 W. SNAP AND CROSS"
  },
  {
    "id": 180,
    "partNumber": "4539102",
    "quantity": 4,
    "color": "New Dark Red",
    "partName": "BRICK 1X2"
  },
  {
    "id": 181,
    "partNumber": "4539104",
    "quantity": 4,
    "color": "New Dark Red",
    "partName": "BRICK 2X2"
  },
  {
    "id": 182,
    "partNumber": "4541376",
    "quantity": 4,
    "color": "New Dark Red",
    "partName": "BRICK 1X1"
  },
  {
    "id": 183,
    "partNumber": "6089268",
    "quantity": 2,
    "color": "New Dark Red",
    "partName": "BRICK 2X6"
  },
  {
    "id": 184,
    "partNumber": "4211183",
    "quantity": 2,
    "color": "Reddish Brown",
    "partName": "ROUND BRICK 1X1"
  },
  {
    "id": 185,
    "partNumber": "4211199",
    "quantity": 2,
    "color": "Reddish Brown",
    "partName": "ROOF TILE 1X2/45°"
  },
  {
    "id": 186,
    "partNumber": "4211221",
    "quantity": 4,
    "color": "Reddish Brown",
    "partName": "ROOF TILE 2X2/45 INV."
  },
  {
    "id": 187,
    "partNumber": "4211225",
    "quantity": 4,
    "color": "Reddish Brown",
    "partName": "BRICK 1X4"
  },
  {
    "id": 188,
    "partNumber": "4211247",
    "quantity": 2,
    "color": "Reddish Brown",
    "partName": "PLATE 2X6"
  },
  {
    "id": 189,
    "partNumber": "4216581",
    "quantity": 3,
    "color": "Reddish Brown",
    "partName": "ROUND PLATE 1X1"
  },
  {
    "id": 190,
    "partNumber": "4216668",
    "quantity": 4,
    "color": "Reddish Brown",
    "partName": "BRICK 2X3"
  },
  {
    "id": 191,
    "partNumber": "4542131",
    "quantity": 2,
    "color": "Reddish Brown",
    "partName": "WINDOW FRAME 1X2X2 2/3"
  },
  {
    "id": 192,
    "partNumber": "6084571",
    "quantity": 2,
    "color": "Reddish Brown",
    "partName": "LATTIC 1/2 FOR FRAME 1X4X3"
  },
  {
    "id": 193,
    "partNumber": "6092659",
    "quantity": 2,
    "color": "Reddish Brown",
    "partName": "WALL ELEMENT 1X4X1 ABS"
  },
  {
    "id": 194,
    "partNumber": "6425510",
    "quantity": 4,
    "color": "Reddish Brown",
    "partName": "ROOF TILE 2X2/45 INVERTED"
  },
  {
    "id": 195,
    "partNumber": "4247145",
    "quantity": 4,
    "color": "Sand Yellow",
    "partName": "BRICK 2X4"
  },
  {
    "id": 196,
    "partNumber": "4255416",
    "quantity": 4,
    "color": "Sand Yellow",
    "partName": "BRICK 2X2"
  },
  {
    "id": 197,
    "partNumber": "4507045",
    "quantity": 4,
    "color": "Sand Yellow",
    "partName": "FLAT TILE 2X2"
  },
  {
    "id": 198,
    "partNumber": "6104578",
    "quantity": 4,
    "color": "Spring Yellowish Green",
    "partName": "BRICK 1X2"
  },
  {
    "id": 199,
    "partNumber": "6211814",
    "quantity": 2,
    "color": "Transparent",
    "partName": "WALL ELEMENT 1X2X3"
  },
  {
    "id": 200,
    "partNumber": "6244886",
    "quantity": 2,
    "color": "Transparent",
    "partName": "ROOF TILE 2X2/45°"
  },
  {
    "id": 201,
    "partNumber": "6244904",
    "quantity": 2,
    "color": "Transparent",
    "partName": "BRICK 1X2 W/O PIN"
  },
  {
    "id": 202,
    "partNumber": "6252258",
    "quantity": 2,
    "color": "Transparent",
    "partName": "GLASS FOR FRAME 1X2X3"
  },
  {
    "id": 203,
    "partNumber": "6254552",
    "quantity": 5,
    "color": "Transparent",
    "partName": "GLASS FOR FRAME 1X2X2"
  },
  {
    "id": 204,
    "partNumber": "6273152",
    "quantity": 2,
    "color": "Transparent",
    "partName": "BRICK Ø16 W. CROSS"
  },
  {
    "id": 205,
    "partNumber": "6286876",
    "quantity": 1,
    "color": "Transparent",
    "partName": "GLASS CASE"
  },
  {
    "id": 206,
    "partNumber": "6507949",
    "quantity": 2,
    "color": "Transparent",
    "partName": "WALL ELEMENT 1X2X3"
  },
  {
    "id": 207,
    "partNumber": "6514262",
    "quantity": 2,
    "color": "Transparent",
    "partName": "BRICK 1X2 W/O PIN"
  },
  {
    "id": 208,
    "partNumber": "6172233",
    "quantity": 3,
    "color": "Transparent Bright Orange",
    "partName": "NOSE CONE SMALL 1X1"
  },
  {
    "id": 209,
    "partNumber": "6240227",
    "quantity": 3,
    "color": "Transparent Bright Orange",
    "partName": "PLATE 1X1 ROUND"
  },
  {
    "id": 210,
    "partNumber": "6273154",
    "quantity": 2,
    "color": "Transparent Bright Orange",
    "partName": "BRICK Ø16 W. CROSS"
  },
  {
    "id": 211,
    "partNumber": "6239416",
    "quantity": 1,
    "color": "Transparent Red",
    "partName": "BRICK 2X2"
  },
  {
    "id": 212,
    "partNumber": "6245252",
    "quantity": 3,
    "color": "Transparent Red",
    "partName": "ROOF TILE 1X1X2/3"
  },
  {
    "id": 213,
    "partNumber": "6514092",
    "quantity": 1,
    "color": "Transparent Red",
    "partName": "BRICK 2X2"
  },
  {
    "id": 214,
    "partNumber": "4541873",
    "quantity": 2,
    "color": "Warm Gold",
    "partName": "LATTIC 1/2 FOR FRAME 1X4X3"
  },
  {
    "id": 215,
    "partNumber": "287701",
    "quantity": 4,
    "color": "White",
    "partName": "PROFILE BRICK 1X2"
  },
  {
    "id": 216,
    "partNumber": "300401",
    "quantity": 4,
    "color": "White",
    "partName": "BRICK 1X2"
  },
  {
    "id": 217,
    "partNumber": "300501",
    "quantity": 4,
    "color": "White",
    "partName": "BRICK 1X1"
  },
  {
    "id": 218,
    "partNumber": "306901",
    "quantity": 3,
    "color": "White",
    "partName": "FLAT TILE 1X2"
  },
  {
    "id": 219,
    "partNumber": "621501",
    "quantity": 4,
    "color": "White",
    "partName": "BRICK 2X3 W. ARCH"
  },
  {
    "id": 220,
    "partNumber": "4121932",
    "quantity": 2,
    "color": "White",
    "partName": "ROOF TILE 1X2/45°"
  },
  {
    "id": 221,
    "partNumber": "4216652",
    "quantity": 2,
    "color": "White",
    "partName": "FINAL BRICK 2X2 TR."
  },
  {
    "id": 222,
    "partNumber": "4515370",
    "quantity": 4,
    "color": "White",
    "partName": "ROOF TILE 2X1X2"
  },
  {
    "id": 223,
    "partNumber": "4521210",
    "quantity": 3,
    "color": "White",
    "partName": "FRAME 1X2X2"
  },
  {
    "id": 224,
    "partNumber": "4528140",
    "quantity": 1,
    "color": "White",
    "partName": "FRAME 2X4X6"
  },
  {
    "id": 225,
    "partNumber": "4584888",
    "quantity": 2,
    "color": "White",
    "partName": "FRAME 2X4X3"
  },
  {
    "id": 226,
    "partNumber": "6047813",
    "quantity": 2,
    "color": "White",
    "partName": "FENCE 1X4X2 W. 4 KNOBS"
  },
  {
    "id": 227,
    "partNumber": "6117940",
    "quantity": 2,
    "color": "White",
    "partName": "ANGLE PLATE 1X2 / 2X2"
  },
  {
    "id": 228,
    "partNumber": "6284599",
    "quantity": 4,
    "color": "White",
    "partName": "FLAT TILE 1X1 - ROUND 'NO. 8'"
  },
  {
    "id": 229,
    "partNumber": "6284604",
    "quantity": 3,
    "color": "White",
    "partName": "FLAT TILE 1X1, ROUND NO. 26"
  },
  {
    "id": 230,
    "partNumber": "6366391",
    "quantity": 4,
    "color": "White",
    "partName": "ROOF TILE 2X2/45 INVERTED"
  },
  { "id": 231, "partNumber": "3039-RED",  "quantity": 8, "color": "Bright Red",         "partName": "SLOPE 2X2/45°" },
  { "id": 232, "partNumber": "3039-YEL",  "quantity": 8, "color": "Bright Yellow",      "partName": "SLOPE 2X2/45°" },
  { "id": 233, "partNumber": "3039-BRY",  "quantity": 8, "color": "Brick Yellow",       "partName": "SLOPE 2X2/45°" },
  { "id": 234, "partNumber": "3039-WHT",  "quantity": 6, "color": "White",              "partName": "SLOPE 2X2/45°" },
  { "id": 235, "partNumber": "3039-GRY",  "quantity": 6, "color": "Medium Stone Grey",  "partName": "SLOPE 2X2/45°" },
  { "id": 236, "partNumber": "3039-DGR",  "quantity": 6, "color": "Dark Stone Grey",    "partName": "SLOPE 2X2/45°" },
  { "id": 237, "partNumber": "3039-BLU",  "quantity": 6, "color": "Bright Blue",        "partName": "SLOPE 2X2/45°" },
  { "id": 238, "partNumber": "3039-ORG",  "quantity": 4, "color": "Dark Orange",        "partName": "SLOPE 2X2/45°" },
  { "id": 239, "partNumber": "3037-RED",  "quantity": 6, "color": "Bright Red",         "partName": "SLOPE 2X4/45°" },
  { "id": 240, "partNumber": "3037-BRY",  "quantity": 6, "color": "Brick Yellow",       "partName": "SLOPE 2X4/45°" },
  { "id": 241, "partNumber": "3037-WHT",  "quantity": 4, "color": "White",              "partName": "SLOPE 2X4/45°" },
  { "id": 242, "partNumber": "3037-GRY",  "quantity": 6, "color": "Medium Stone Grey",  "partName": "SLOPE 2X4/45°" },
  { "id": 243, "partNumber": "3037-BLU",  "quantity": 4, "color": "Bright Blue",        "partName": "SLOPE 2X4/45°" },
  { "id": 244, "partNumber": "3040-RED",  "quantity": 12, "color": "Bright Red",        "partName": "SLOPE 1X2/45°" },
  { "id": 245, "partNumber": "3040-BRY",  "quantity": 12, "color": "Brick Yellow",      "partName": "SLOPE 1X2/45°" },
  { "id": 246, "partNumber": "3040-WHT",  "quantity": 10, "color": "White",             "partName": "SLOPE 1X2/45°" },
  { "id": 247, "partNumber": "3040-GRY",  "quantity": 10, "color": "Medium Stone Grey", "partName": "SLOPE 1X2/45°" },
  { "id": 248, "partNumber": "3040-YEL",  "quantity": 8,  "color": "Bright Yellow",     "partName": "SLOPE 1X2/45°" },

  // ── 2×4 Brick (additional colors) ──────────────────────────────────────────
  { "id": 249, "partNumber": "300228", "quantity": 8, "color": "Bright Green",      "partName": "BRICK 2X4" },
  { "id": 250, "partNumber": "300271", "quantity": 6, "color": "Dark Stone Grey",   "partName": "BRICK 2X4" },
  { "id": 251, "partNumber": "300201", "quantity": 6, "color": "White",             "partName": "BRICK 2X4" },
  { "id": 252, "partNumber": "300225", "quantity": 6, "color": "Brick Yellow",      "partName": "BRICK 2X4" },

  // ── 2×2 Plate ───────────────────────────────────────────────────────────────
  { "id": 253, "partNumber": "302221", "quantity": 8, "color": "Bright Red",        "partName": "PLATE 2X2" },
  { "id": 254, "partNumber": "302223", "quantity": 8, "color": "Bright Blue",       "partName": "PLATE 2X2" },
  { "id": 255, "partNumber": "302224", "quantity": 8, "color": "Bright Yellow",     "partName": "PLATE 2X2" },
  { "id": 256, "partNumber": "302201", "quantity": 6, "color": "White",             "partName": "PLATE 2X2" },
  { "id": 257, "partNumber": "302271", "quantity": 6, "color": "Dark Stone Grey",   "partName": "PLATE 2X2" },

  // ── 1×1 Round Plate (additional colors) ────────────────────────────────────
  { "id": 258, "partNumber": "614123", "quantity": 6, "color": "Bright Blue",       "partName": "ROUND PLATE 1X1" },
  { "id": 259, "partNumber": "614124", "quantity": 6, "color": "Bright Yellow",     "partName": "ROUND PLATE 1X1" },
  { "id": 260, "partNumber": "614101", "quantity": 4, "color": "White",             "partName": "ROUND PLATE 1X1" },
  { "id": 261, "partNumber": "614126", "quantity": 4, "color": "Black",             "partName": "ROUND PLATE 1X1" },
  { "id": 262, "partNumber": "614171", "quantity": 4, "color": "Dark Stone Grey",   "partName": "ROUND PLATE 1X1" },

  // ── M Motor ─────────────────────────────────────────────────────────────────
  { "id": 263, "partNumber": "88008-DGR", "quantity": 1, "color": "Dark Stone Grey",  "partName": "M MOTOR 3X6",
    "shapeType": "custom", "dims": { "w": 3, "d": 6, "h": 3 } },
  { "id": 264, "partNumber": "88008-GRY", "quantity": 1, "color": "Medium Stone Grey","partName": "M MOTOR 3X6",
    "shapeType": "custom", "dims": { "w": 3, "d": 6, "h": 3 } },

  // ── Technic Gear 24T ────────────────────────────────────────────────────────
  { "id": 265, "partNumber": "3648-GRY", "quantity": 2, "color": "Medium Stone Grey", "partName": "TECHNIC GEAR 24T",
    "shapeType": "gear", "dims": { "w": 3, "d": 3, "h": 1 } },
  { "id": 266, "partNumber": "3648-BLK", "quantity": 2, "color": "Black",             "partName": "TECHNIC GEAR 24T",
    "shapeType": "gear", "dims": { "w": 3, "d": 3, "h": 1 } }
];
