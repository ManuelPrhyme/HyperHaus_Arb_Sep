// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract HyperHaus {

    uint public vested;
    address immutable private VestingContract;

     struct Guild {
        address ownerAddress;
        string ownerName;
        string  guildName;
        string descript;
        uint256 createdAt;
        uint256 entryThreshold;
        uint256 memberCap;
        bool capped;
        string[] memberNames;
        address[] memberAddresses;
        uint256[] memberStakes;
        uint256 pool;
        uint16 risk_threshold;
    }

    struct TradeProposal {
        bytes32 guildId;
        bytes4 proposalId;
        address trader;
        uint256 amount;
        string descript;
        uint8 yesVotes;
        uint8 totalVotes;
        address[] voters;
        bool approved;
        bool executed;
        bool fulfilled;
    }

    bytes32[] public guildIds;
     
    mapping(bytes32 => Guild) public guilds;
    uint256 public guildCount;
    TradeProposal[] public guildProposals;

    constructor(address _vesting){
        VestingContract = _vesting;
    }

    function util_isMember(bytes32 GuildId, address user)private view returns(bool) {
           
            address[] memory _members = guilds[GuildId].memberAddresses;

            for(uint8 c; c < _members.length; c++) {
                if(_members[c] == user) return true;
            }

        return false;
    }
    
       function util_abs(int256 x) internal pure returns(uint256){
        return uint256(x >= 0 ? x : -x);
    }

    function createGuild(
        string memory _creatorName, 
        string memory _guildName,
        string memory _description,
        uint256 memberCap, 
        uint256 entryThreshold,
        uint16 _riskThreshold

        ) external payable {
        
        require(entryThreshold <= msg.value,"Deposit Entry Threshold");
               
        bytes32 GuildId = keccak256(abi.encode(msg.sender, guildCount));

        guildIds.push(GuildId);

        guilds[GuildId] = Guild({
            ownerAddress: msg.sender, 
            ownerName: _creatorName,
            guildName: _guildName,
            descript: _description,
            createdAt: block.timestamp, 
            entryThreshold: entryThreshold, 
            memberCap: memberCap,
            capped: false,
            memberNames: new string[](0),
            memberAddresses: new address[](0),
            memberStakes: new uint[](0),
            pool: msg.value,
            risk_threshold: _riskThreshold
        });

        guilds[GuildId].memberNames.push(_creatorName);
        guilds[GuildId].memberAddresses.push(msg.sender);
        guilds[GuildId].memberStakes.push(msg.value);
   
        guildCount++;
    }

    function topUpStake(bytes32 guildId) external payable {
    require(msg.value > 0, "Send valid amount");
    require(util_isMember(guildId, msg.sender), "Not a guild member");
    

    uint256 memberIndex;

    for (uint256 i = 0; i < guilds[guildId].memberAddresses.length; i++) {
        if (guilds[guildId].memberAddresses[i] == msg.sender) {
            memberIndex = i;
            break;
        }
    }
    guilds[guildId].memberStakes[memberIndex] += msg.value;
    guilds[guildId].pool += msg.value;
    }

    function joinGuild(bytes32 GuildId, string memory _memberName) external payable {
        require(!util_isMember(GuildId, msg.sender) && !guilds[GuildId].capped,"Cap reached / Already member");
        require(msg.value >=  guilds[GuildId].entryThreshold,"Deposit Entry Threshold");

        guilds[GuildId].memberNames.push(_memberName);
        guilds[GuildId].memberAddresses.push(msg.sender);
        guilds[GuildId].memberStakes.push(msg.value);
        guilds[GuildId].pool += msg.value;

        if (guilds[GuildId].memberAddresses.length == guilds[GuildId].memberCap) {
            guilds[GuildId].capped = true;}
    
    }

    function proposeTrade(bytes32 _guildId, uint256 amount, string memory description) external {
         require(util_isMember(_guildId, msg.sender),"Not a member");
         uint256 riskThreshold = (guilds[_guildId].risk_threshold*guilds[_guildId].pool)/100;
         require(amount <= riskThreshold,"Risk_Scale too high");

         bytes4 propId = bytes4(keccak256(abi.encode(_guildId,msg.sender,block.timestamp)));
         
         guildProposals.push(TradeProposal({
               guildId: _guildId,
               proposalId:propId,
               trader: msg.sender,
               amount: amount,
               descript: description, 
               yesVotes: 0,
               totalVotes: 0,
               voters: new address[](0),
               approved: false,
               executed: false,
               fulfilled: false
         }));

    }

    function voteProposal(bytes32 _guildId, bytes4 _proposalId, bool _voteYes) external {
        require(util_isMember(_guildId, msg.sender),"Not a member");
        uint8 index;
        bool active;

        for(uint8 c = 0; c < guildProposals.length; c++){
                if(guildProposals[c].proposalId == _proposalId) {
                    index = c;
                    active =  true;
                }
        }

        require(active,"Enter correct ProposalId");

        for (uint8 c = 0; c < guildProposals[index].voters.length; c++){
            if(msg.sender == guildProposals[index].voters[c]) {
                revert("Already voted");
                }
         }

        if (_voteYes) {
            guildProposals[index].yesVotes++;
            guildProposals[index].totalVotes++;
            guildProposals[index].voters.push(msg.sender);
        } else {
            guildProposals[index].totalVotes++;
            guildProposals[index].voters.push(msg.sender);
        }

        if(guilds[_guildId].memberAddresses.length == 2){
            if(guildProposals[index].yesVotes == 2){
                guildProposals[index].approved = true;
            }
        }else if(guilds[_guildId].memberAddresses.length > 2){
           if((guildProposals[index].totalVotes >  (guilds[_guildId].memberAddresses.length)/2) && 
                guildProposals[index].yesVotes > (guildProposals[index].totalVotes)/2){ 
                    guildProposals[index].approved = true;
           }
        }

    }

    function executeProposal(bytes4 _proposalId) external {
        uint256 index;
        bool found;

        for (uint256 i = 0; i < guildProposals.length; i++) {
            if (guildProposals[i].proposalId == _proposalId) {
            index = i;
            found = true;
            break;
            }
        }

        require(found, "Enter correct Proposal ID");
        require(guildProposals[index].approved, "Proposal not approved yet");
        require(!guildProposals[index].executed, "Proposal already executed");
        require(msg.sender == guildProposals[index].trader, "Unauthorised account");
        require(guilds[guildProposals[index].guildId].pool >= guildProposals[index].amount, "Current pool amount is insufficient");

    
        (bool sent, ) = payable(msg.sender).call{value: guildProposals[index].amount}("");
    
        guildProposals[index].executed = true;
        guilds[guildProposals[index].guildId].pool -= guildProposals[index].amount;

    }

    function returnTradeFunds(bytes4 _proposalId) external payable{

        uint16 index;
        bool found;

         for (uint16 i = 0; i < guildProposals.length; i++) {
            if (guildProposals[i].proposalId == _proposalId) {
                index = i;
                found = true;
                break;
            }
        }
        
        require(found, "Enter correct Proposal ID");
        
        uint256 totalStake;
        uint256[] memory stakes = guilds[guildProposals[index].guildId].memberStakes;
        address[] memory members = guilds[guildProposals[index].guildId].memberAddresses;


        for (uint256 i = 0; i < stakes.length; i++) {
            totalStake += stakes[i];
        }
        
        require(guildProposals[index].executed, "Proposal not executed yet");
        require(msg.sender == guildProposals[index].trader, "Only trader can return funds");
        require(!guildProposals[index].fulfilled, "Proposal already fulfilled");

        uint256 Principal = guildProposals[index].amount;
        int256 Margin = int256(msg.value) - int256(Principal);

        guilds[guildProposals[index].guildId].pool += Principal;

        if (Margin > 0) {
            bytes memory CallData = abi.encodeWithSignature("Vesting(address[],uint256[],uint256,bytes32)",
            guilds[guildProposals[index].guildId].memberAddresses,
            guilds[guildProposals[index].guildId].memberStakes,
            15,
            guildProposals[index].guildId
            );

            uint _Margin = util_abs(Margin);
            uint256 vestingAmount = (_Margin * 40) / 100;
            vested = vestingAmount;

            (bool sentVesting, ) = payable(VestingContract).call{value:vestingAmount}(CallData);
            require(sentVesting, "Failed to send to vesting contract");

            uint256 distributableProfit = _Margin - vestingAmount;

            //Traders profit
            uint256 traderShare = (distributableProfit * 40) / 100;
            (bool sentTrader,) = (guildProposals[index].trader).call{value:traderShare}("");
            require(sentTrader, "Failed to send trader share");

            //Guild's Profit
            uint256 memberSharePool = distributableProfit - traderShare;

        for (uint256 i = 0; i < members.length; i++) {
            uint256 memberReward = 0;

            if (totalStake > 0) {
                memberReward = (memberSharePool * stakes[i]) / totalStake;
            }
            
            if (memberReward > 0) {
                (bool sentMember, ) = payable(members[i]).call{value: memberReward}("");
                    }
                }
            } else if (Margin < 0) {

                 uint256 tradersLoss = (util_abs(Margin) * 40) / 100;

                uint256 distributableLoss = util_abs(Margin) - tradersLoss;


            for(uint16 c = 0; c < guilds[guildProposals[index].guildId].memberAddresses.length; c++){
                if(guilds[guildProposals[index].guildId].memberAddresses[c] == msg.sender){
                    guilds[guildProposals[index].guildId].memberStakes[c] -= tradersLoss;
                }
            }
          

        for (uint256 i = 0; i < members.length; i++) {
            uint256 memberLoss = 0;

            if (totalStake > 0) {
                memberLoss = (distributableLoss * stakes[i]) / totalStake;
            }
            
            if (memberLoss > 0) {
                
               guilds[guildProposals[index].guildId].memberStakes[i] -= memberLoss;
                    
                    }
            }
                
            }

            guilds[guildProposals[index].guildId].pool -= util_abs(Margin);

            guildProposals[index].fulfilled = true;
        }

        function vestingCancelled(address _guildMember, bytes32 _guildId) external payable returns(bool){
                // uint256 _memberIndex;
                for(uint8 c=0; c < guilds[_guildId].memberAddresses.length; c++){
                    if(guilds[_guildId].memberAddresses[c] == _guildMember){
                         
                         guilds[_guildId].memberStakes[c] += msg.value;

                        return true;
                    }
                }
                revert("Not a member");
                return false;
        }
        

    //Read Functions
    function GuildIds () external view returns(bytes32[] memory){
        return guildIds;
    }

    function GuildData(bytes32 _GuildId) external view returns(Guild memory, TradeProposal[] memory) {
        uint16 count;
        uint16 incrementer;

        for(uint16 c = 0; c < guildProposals.length; c++){
                if(guildProposals[c].guildId == _GuildId) count++;
        }

        TradeProposal[] memory thisGuildsProposals = new TradeProposal[](count);

        for(uint16 c = 0; c < guildProposals.length; c++){
                if(guildProposals[c].guildId == _GuildId) {
                    thisGuildsProposals[incrementer] = guildProposals[c];   
                    incrementer++;
                }
        }
        return (guilds[_GuildId],thisGuildsProposals);
    }

}