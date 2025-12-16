// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract HyperHausVesting {

    
    uint256 public constant MAX_VESTING_DURATION = 31536000; 
    uint256 public constant WEEK = 604800;

    uint256 public currentCycleStart;

    struct VestingSchedule {
        uint256 Id;
        bytes32 guildFrom;
        address owner;           
        uint256 totalAmount;     
        uint256 amountClaimed;   
        uint256 startTimestamp;  
        uint256 cliffDuration;   
        bool cancelled;       
        bool active;          
    }

    VestingSchedule[] public vestingSchedules;

    mapping(address => uint256[]) public userSchedules;

    constructor() {
        currentCycleStart = block.timestamp;
    }

    function resetCycle() internal {
        require(block.timestamp >= currentCycleStart + MAX_VESTING_DURATION, "Yearly cycle not ended");

        uint256 len = vestingSchedules.length;

        for (uint256 i = 0; i < len; i++) {
            vestingSchedules.pop();
        }

        currentCycleStart = block.timestamp;
    }

    function Vesting(address[] calldata members, uint256[] calldata stakes, uint256 cliffDuration, bytes32 _guildFrom) external payable {
        require(members.length == stakes.length, "Members/stakes mismatch");
        require(cliffDuration <= MAX_VESTING_DURATION, "Cliff duration must be less that Vesting Duration");
        require(msg.value > 0, "Must send native tokens");

        if (block.timestamp >= currentCycleStart + MAX_VESTING_DURATION) {
            resetCycle(); 
        }

        uint256 totalStake = 0;

        for (uint256 i = 0; i < stakes.length; i++) {
            totalStake += stakes[i];
        }
        require(totalStake > 0, "Total stake must be > 0");

        uint256 totalFund = msg.value;

        for (uint256 i = 0; i < members.length; i++) {
            if (stakes[i] == 0) continue;

            uint256 userAmount = (totalFund * stakes[i]) / totalStake;
            if (userAmount == 0) continue;

            uint256 scheduleId = vestingSchedules.length;

            VestingSchedule memory newSchedule = VestingSchedule({
                Id: scheduleId,
                guildFrom: _guildFrom,
                owner: members[i],
                totalAmount: userAmount,
                amountClaimed: 0,
                startTimestamp: block.timestamp,
                cliffDuration: cliffDuration,
                cancelled: false,
                active: true
            });

            vestingSchedules.push(newSchedule);
        }
    }

    function totalSchedules() external view returns (uint256) {
        return vestingSchedules.length;
    }


    function userSchedulesCount(address user) external view returns (uint256) {
        return userSchedules[user].length;
    }

    function vestedAmount(uint256 scheduleId) public view returns (uint256) {
        require(scheduleId < vestingSchedules.length, "Invalid schedule id");


        if (!vestingSchedules[scheduleId].active || vestingSchedules[scheduleId].cancelled) {
            return vestingSchedules[scheduleId].amountClaimed;
        }

        uint256 cliffEnd = vestingSchedules[scheduleId].startTimestamp + vestingSchedules[scheduleId].cliffDuration;
        if (block.timestamp < cliffEnd) {
            return 0;
        }

        uint256 elapsed = block.timestamp - cliffEnd;
        if (elapsed >= MAX_VESTING_DURATION) {
            return vestingSchedules[scheduleId].totalAmount;
        }

        uint256 weeksElapsed = elapsed / WEEK;
        uint256 totalWeeks = MAX_VESTING_DURATION / WEEK;

        return (vestingSchedules[scheduleId].totalAmount * weeksElapsed) / totalWeeks;
    }


    function claim(uint256 scheduleId) external {
        require(scheduleId < vestingSchedules.length, "Invalid schedule id");

        require(vestingSchedules[scheduleId].owner == msg.sender, "Not schedule owner");
        require(!vestingSchedules[scheduleId].cancelled, "Schedule cancelled");

        uint256 vested = vestedAmount(scheduleId);
        require(vested >= vestingSchedules[scheduleId].amountClaimed, "No claimable tokens");

        uint256 claimable = vested - vestingSchedules[scheduleId].amountClaimed;
        vestingSchedules[scheduleId].amountClaimed = vested;

        (bool success, ) = payable(msg.sender).call{value: claimable}("");
        require(success, "Transfer failed");

    }

    function cancelSchedule(uint256 scheduleId, address _guildContract) external {
        require(scheduleId < vestingSchedules.length, "Invalid schedule id");
        require(vestingSchedules[scheduleId].owner == msg.sender,"Unauthorized account");
        require(!vestingSchedules[scheduleId].cancelled, "Already cancelled");

            bytes memory CallData = abi.encodeWithSignature("vestingCancelled(address,bytes32)",
            vestingSchedules[scheduleId].owner, vestingSchedules[scheduleId].guildFrom);

            uint256 cancelAmount = vestingSchedules[scheduleId].totalAmount - vestingSchedules[scheduleId].amountClaimed;

            (bool Success,) = payable(_guildContract).call{value:cancelAmount}(CallData);
            require(Success,"Guilds Contract Call Failed");

        vestingSchedules[scheduleId].cancelled = true;
        vestingSchedules[scheduleId].active = false;

    }

    function getUserSchedules(address user) external view returns (uint256[] memory) {
        return userSchedules[user];
    }

    
    receive() external payable {
        revert("Direct native transfers not allowed");
    }
}
