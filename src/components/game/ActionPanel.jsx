// src/components/game/ActionPanel.jsx
import { useState } from 'react'
import { Check, AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { ACTIONS, ROLE_COLORS } from '../../lib/constants'
import { cn } from '../../lib/utils'

export function ActionPanel({ role, onSubmit, disabled, currentAction }) {
  const [selected, setSelected] = useState(currentAction || null)
  const actions = ACTIONS[role] || []
  const roleColor = ROLE_COLORS[role]

  const handleSubmit = () => {
    if (selected) {
      onSubmit(selected)
    }
  }

  if (!actions.length) return null

  return (
    <Card className={cn('border-2', roleColor?.border)}>
      <CardHeader className={roleColor?.bg}>
        <CardTitle className={cn('flex items-center gap-2', roleColor?.text)}>
          Choose Your Action
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => !disabled && setSelected(action.id)}
              disabled={disabled}
              className={cn(
                'action-card text-left',
                'border-slate-700 bg-slate-800/50',
                selected === action.id && `action-card-selected ${roleColor?.border} ring-${roleColor?.primary}-500`,
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-slate-200">{action.name}</h4>
                {selected === action.id && (
                  <Check className={cn('w-5 h-5', roleColor?.text)} />
                )}
              </div>
              <p className="text-sm text-slate-400 mb-3">{action.description}</p>
              <div className="flex gap-2">
                <Badge variant={action.risk > 2 ? 'danger' : action.risk > 0 ? 'warning' : 'success'}>
                  Risk: {action.risk}
                </Badge>
                <Badge variant="info">
                  Reward: {action.reward}
                </Badge>
              </div>
            </button>
          ))}
        </div>

        {currentAction && (
          <div className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-800 rounded-lg">
            <Check className="w-5 h-5 text-green-500" />
            <span className="text-green-400">Action submitted - waiting for round to end</span>
          </div>
        )}

        {!currentAction && (
          <Button 
            onClick={handleSubmit}
            disabled={!selected || disabled}
            variant={role}
            className="w-full"
            size="lg"
          >
            {selected ? 'Confirm Action' : 'Select an Action'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
