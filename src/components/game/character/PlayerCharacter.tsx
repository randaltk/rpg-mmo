"use client";

import React, { memo } from "react";
import { Player } from "@/types/game";
import { deriveCharacterColors } from "./colors";
import { getClassConfig } from "./classes";
import { useCharacterAnimation } from "./useCharacterAnimation";
import CharacterTorso from "./CharacterTorso";
import CharacterHead from "./CharacterHead";
import CharacterArm from "./CharacterArm";
import CharacterLeg from "./CharacterLeg";
import CharacterUI from "./CharacterUI";
import WeaponMesh from "./equipment/WeaponMesh";
import ShieldMesh from "./equipment/weapons/ShieldMesh";
import BookMesh from "./equipment/weapons/BookMesh";

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
  const classConfig = getClassConfig(player.characterClass ?? "knight");
  const colors = deriveCharacterColors(classConfig.colors);
  const refs = useCharacterAnimation({ player, isCurrentPlayer, targetPosition });

  return (
    <group ref={refs.groupRef} position={[player.x, player.y, player.z]}>
      <group ref={refs.bodyRef}>
        <CharacterTorso capeRef={refs.capeRef} colors={colors} classConfig={classConfig} />

        <group ref={refs.headRef} position={[0, 1.65, 0]}>
          <CharacterHead
            skinColor={colors.skinColor}
            hairColor={colors.hairColor}
            headgear={classConfig.headgear}
            headgearColor={colors.primary}
            headgearAccent={colors.accent}
          />
        </group>

        <CharacterArm side="left" armRef={refs.leftArmRef} colors={colors}>
          {classConfig.offhand === "shield" && (
            <ShieldMesh color={colors.secondary} accentColor={colors.accent} />
          )}
          {classConfig.offhand === "book" && <BookMesh />}
        </CharacterArm>

        <CharacterArm side="right" armRef={refs.weaponArmRef} colors={colors}>
          <WeaponMesh type={classConfig.weaponType} />
        </CharacterArm>
      </group>

      <CharacterLeg
        side="left"
        legRef={refs.leftLegRef}
        pantsColor={colors.pantsColor}
        bootColor={colors.bootColor}
        bootTrim={colors.bootTrim}
      />
      <CharacterLeg
        side="right"
        legRef={refs.rightLegRef}
        pantsColor={colors.pantsColor}
        bootColor={colors.bootColor}
        bootTrim={colors.bootTrim}
      />

      <CharacterUI player={player} isCurrentPlayer={isCurrentPlayer} />
    </group>
  );
}

export default memo(PlayerCharacter, (prev, next) => {
  if (prev.isCurrentPlayer) {
    return (
      prev.targetPosition?.x === next.targetPosition?.x &&
      prev.targetPosition?.z === next.targetPosition?.z
    );
  }
  return (
    prev.player.x === next.player.x &&
    prev.player.z === next.player.z &&
    prev.player.hp === next.player.hp &&
    prev.player.level === next.player.level &&
    prev.player.nickname === next.player.nickname &&
    prev.player.characterClass === next.player.characterClass
  );
});
