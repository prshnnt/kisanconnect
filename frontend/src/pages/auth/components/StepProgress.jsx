import { Box, Typography } from '@mui/material'

function StepProgress({ currentStep, totalSteps = 4 }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 200 }}>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 700,
          color: '#1b5e20',
          mb: 0.8,
          fontSize: '0.95rem',
        }}
      >
        {currentStep}/{totalSteps}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', width: 180 }}>
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNum = index + 1
          const isCompleted = stepNum < currentStep
          const isActive = stepNum === currentStep

          return (
            <Box
              key={stepNum}
              sx={{
                display: 'flex',
                alignItems: 'center',
                flex: index < totalSteps - 1 ? 1 : 'none',
              }}
            >
              {/* Step Node */}
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  boxSizing: 'border-box',
                  transition: 'all 0.25s ease',
                  ...(isCompleted
                    ? {
                        backgroundColor: '#2e7d32',
                        border: '2px solid #2e7d32',
                      }
                    : isActive
                    ? {
                        backgroundColor: '#ffffff',
                        border: '2.5px solid #2e7d32',
                      }
                    : {
                        backgroundColor: '#cfd8dc',
                        border: '2px solid #cfd8dc',
                      }),
                }}
              />

              {/* Connecting Line between nodes */}
              {index < totalSteps - 1 && (
                <Box
                  sx={{
                    flexGrow: 1,
                    height: 2,
                    mx: 0.5,
                    backgroundColor: stepNum < currentStep ? '#2e7d32' : '#cfd8dc',
                    transition: 'background-color 0.25s ease',
                  }}
                />
              )}
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

export default StepProgress
