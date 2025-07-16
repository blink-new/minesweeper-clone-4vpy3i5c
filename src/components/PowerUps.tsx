import { PowerUp } from '../types/game';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface PowerUpsProps {
  powerUps: PowerUp[];
  onUsePowerUp: (powerUpId: string) => void;
  xrayActive: boolean;
  timeFrozen: boolean;
}

export function PowerUps({ powerUps, onUsePowerUp, xrayActive, timeFrozen }: PowerUpsProps) {
  const getCooldownRemaining = (powerUp: PowerUp): number => {
    const now = Date.now();
    const timeSinceLastUse = (now - powerUp.lastUsed) / 1000;
    return Math.max(0, powerUp.cooldown - timeSinceLastUse);
  };

  const isOnCooldown = (powerUp: PowerUp): boolean => {
    return getCooldownRemaining(powerUp) > 0;
  };

  const canUsePowerUp = (powerUp: PowerUp): boolean => {
    return powerUp.uses > 0 && !isOnCooldown(powerUp);
  };

  const getStatusBadge = (powerUp: PowerUp) => {
    if (powerUp.id === 'xray' && xrayActive) {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">ACTIVE</Badge>;
    }
    if (powerUp.id === 'timefreeze' && timeFrozen) {
      return <Badge variant="secondary" className="bg-purple-100 text-purple-800">ACTIVE</Badge>;
    }
    if (isOnCooldown(powerUp)) {
      return <Badge variant="outline" className="text-orange-600">{Math.ceil(getCooldownRemaining(powerUp))}s</Badge>;
    }
    if (powerUp.uses === 0) {
      return <Badge variant="secondary" className="bg-gray-100 text-gray-600">USED</Badge>;
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Power-Ups</h3>
        <p className="text-sm text-gray-600">Special abilities to help you win!</p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {powerUps.map((powerUp) => (
          <TooltipProvider key={powerUp.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className={`transition-all duration-200 ${
                  canUsePowerUp(powerUp) 
                    ? 'hover:shadow-md cursor-pointer border-blue-200' 
                    : 'opacity-60 cursor-not-allowed'
                }`}>
                  <CardContent className="p-3">
                    <Button
                      onClick={() => onUsePowerUp(powerUp.id)}
                      disabled={!canUsePowerUp(powerUp)}
                      variant="ghost"
                      className="w-full h-auto p-0 flex flex-col items-center space-y-2"
                    >
                      <div className="text-2xl">{powerUp.icon}</div>
                      <div className="text-center">
                        <div className="font-medium text-sm">{powerUp.name}</div>
                        <div className="flex items-center justify-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {powerUp.uses}/{powerUp.maxUses}
                          </Badge>
                          {getStatusBadge(powerUp)}
                        </div>
                      </div>
                    </Button>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <p className="font-medium">{powerUp.name}</p>
                  <p className="text-sm text-gray-600">{powerUp.description}</p>
                  {powerUp.cooldown > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Cooldown: {powerUp.cooldown}s
                    </p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>

      {/* Active Effects Display */}
      {(xrayActive || timeFrozen) && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Active Effects:</h4>
          {xrayActive && (
            <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 px-3 py-2 rounded-lg">
              <span>👁️</span>
              <span>X-Ray Vision Active</span>
            </div>
          )}
          {timeFrozen && (
            <div className="flex items-center gap-2 text-sm text-purple-700 bg-purple-50 px-3 py-2 rounded-lg">
              <span>⏸️</span>
              <span>Time Frozen</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}