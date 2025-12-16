//This is Arbitrum Sepolia

export const contractAddress = "0x4f0524300eb7d23c144be0a5eab3bae447e16925";
export const contractABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "_creatorName",
        type: "string",
      },
      {
        internalType: "string",
        name: "_guildName",
        type: "string",
      },
      {
        internalType: "string",
        name: "_description",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "memberCap",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "entryThreshold",
        type: "uint256",
      },
      {
        internalType: "uint16",
        name: "_riskThreshold",
        type: "uint16",
      },
    ],
    name: "createGuild",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "_proposalId",
        type: "bytes4",
      },
    ],
    name: "executeProposal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "GuildId",
        type: "bytes32",
      },
      {
        internalType: "string",
        name: "_memberName",
        type: "string",
      },
    ],
    name: "joinGuild",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_guildId",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "description",
        type: "string",
      },
    ],
    name: "proposeTrade",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "_proposalId",
        type: "bytes4",
      },
    ],
    name: "returnTradeFunds",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "guildId",
        type: "bytes32",
      },
    ],
    name: "topUpStake",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_vesting",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_guildMember",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "_guildId",
        type: "bytes32",
      },
    ],
    name: "vestingCancelled",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_guildId",
        type: "bytes32",
      },
      {
        internalType: "bytes4",
        name: "_proposalId",
        type: "bytes4",
      },
      {
        internalType: "bool",
        name: "_voteYes",
        type: "bool",
      },
    ],
    name: "voteProposal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "guildCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_GuildId",
        type: "bytes32",
      },
    ],
    name: "GuildData",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "ownerAddress",
            type: "address",
          },
          {
            internalType: "string",
            name: "ownerName",
            type: "string",
          },
          {
            internalType: "string",
            name: "guildName",
            type: "string",
          },
          {
            internalType: "string",
            name: "descript",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "createdAt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "entryThreshold",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "memberCap",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "capped",
            type: "bool",
          },
          {
            internalType: "string[]",
            name: "memberNames",
            type: "string[]",
          },
          {
            internalType: "address[]",
            name: "memberAddresses",
            type: "address[]",
          },
          {
            internalType: "uint256[]",
            name: "memberStakes",
            type: "uint256[]",
          },
          {
            internalType: "uint256",
            name: "pool",
            type: "uint256",
          },
          {
            internalType: "uint16",
            name: "risk_threshold",
            type: "uint16",
          },
        ],
        internalType: "struct HyperHaus.Guild",
        name: "",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "bytes32",
            name: "guildId",
            type: "bytes32",
          },
          {
            internalType: "bytes4",
            name: "proposalId",
            type: "bytes4",
          },
          {
            internalType: "address",
            name: "trader",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "descript",
            type: "string",
          },
          {
            internalType: "uint8",
            name: "yesVotes",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "totalVotes",
            type: "uint8",
          },
          {
            internalType: "address[]",
            name: "voters",
            type: "address[]",
          },
          {
            internalType: "bool",
            name: "approved",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "executed",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "fulfilled",
            type: "bool",
          },
        ],
        internalType: "struct HyperHaus.TradeProposal[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "guildIds",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "GuildIds",
    outputs: [
      {
        internalType: "bytes32[]",
        name: "",
        type: "bytes32[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "guildProposals",
    outputs: [
      {
        internalType: "bytes32",
        name: "guildId",
        type: "bytes32",
      },
      {
        internalType: "bytes4",
        name: "proposalId",
        type: "bytes4",
      },
      {
        internalType: "address",
        name: "trader",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "descript",
        type: "string",
      },
      {
        internalType: "uint8",
        name: "yesVotes",
        type: "uint8",
      },
      {
        internalType: "uint8",
        name: "totalVotes",
        type: "uint8",
      },
      {
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "executed",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "fulfilled",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "guilds",
    outputs: [
      {
        internalType: "address",
        name: "ownerAddress",
        type: "address",
      },
      {
        internalType: "string",
        name: "ownerName",
        type: "string",
      },
      {
        internalType: "string",
        name: "guildName",
        type: "string",
      },
      {
        internalType: "string",
        name: "descript",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "createdAt",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "entryThreshold",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "memberCap",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "capped",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "pool",
        type: "uint256",
      },
      {
        internalType: "uint16",
        name: "risk_threshold",
        type: "uint16",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "vested",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export const vestingAddress = "0xdE8E6564Fddcb0D6767937322B9C9b48CdE42696";
export const vestingABI = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "scheduleId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_guildContract",
        type: "address",
      },
    ],
    name: "cancelSchedule",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "scheduleId",
        type: "uint256",
      },
    ],
    name: "claim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "members",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "stakes",
        type: "uint256[]",
      },
      {
        internalType: "uint256",
        name: "cliffDuration",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "_guildFrom",
        type: "bytes32",
      },
    ],
    name: "Vesting",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
  {
    inputs: [],
    name: "currentCycleStart",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getUserSchedules",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MAX_VESTING_DURATION",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSchedules",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "userSchedules",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "userSchedulesCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "scheduleId",
        type: "uint256",
      },
    ],
    name: "vestedAmount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "vestingSchedules",
    outputs: [
      {
        internalType: "uint256",
        name: "Id",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "guildFrom",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "totalAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amountClaimed",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "startTimestamp",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "cliffDuration",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "cancelled",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "active",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "WEEK",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
