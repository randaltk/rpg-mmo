"use client";

import React, { memo } from "react";
import { Player } from "@/types/game";
import { deriveCharacterColors } from "./colors";
import { useCharacterAnimation } from "./useCharacterAnimation";
import CharacterTorso from "./CharacterTorso";
import CharacterHead from "./CharacterHead";
import CharacterArm from "./CharacterArm";
import CharacterLeg from "./CharacterLeg";
import CharacterUI from "./CharacterUI";

interface PlayerCharacterProps {
  player: Player;
  isCurrentPlayer?: boolean;
  targetPosition?: { x: number; z: number } | null;
}

function PlayerCharacter({
  player,
  isCurrentPlayer = false,
  targetPosition = null,
}: PlayerCharacterProps) {
  const colors = deriveCharacterColors(player.color);
  const refs = useCharacterAnimation({ player, isCurrentPlayer, targetPosition });

  return (
    <group ref={refs.groupRef} position={[player.x, player.y, player.z]}>
      <group ref={refs.bodyRef}>
        <CharacterTorso capeRef={refs.capeRef} colors={colors} />

        <group ref={refs.headRef} position={[0, 1.65, 0]}>
          <CharacterHead skinColor={colors.skinColor} hairColor={colors.hairColor} />
        </group>

        <CharacterArm side="left" armRef={refs.leftArmRef} shirtColor={colors.shirtColor} skinColor={colors.skinColor} />
        <CharacterArm side="right" armRef={refs.swordArmRef} shirtColor={colors.shirtColor} skinColor={colors.skinColor} hasSword />
      </group>

      <CharacterLeg side="left" legRef={refs.leftLegRef} pantsColor={colors.pantsColor} bootColor={colors.bootColor} bootTrim={colors.bootTrim} />
      <CharacterLeg side="right" legRef={refs.rightLegRef} pantsColor={colors.pantsColor} bootColor={colors.bootColor} bootTrim={colors.bootTrim} />

      <CharacterUI player={player} isCurrentPlayer={isCurrentPlayer} />
    </group>
  );
}

export default memo(PlayerCharacter, (prev, next) => {
  if (prev.isCurrentPlayer) {
    return prev.targetPosition?.x === next.targetPosition?.x &&
      prev.targetPosition?.z === next.targetPosition?.z;
  }
  return prev.player.x === next.player.x &&
    prev.player.z === next.player.z &&
    prev.player.hp === next.player.hp &&
    prev.player.level === next.player.level &&
    prev.player.nickname === next.player.nickname;
});
