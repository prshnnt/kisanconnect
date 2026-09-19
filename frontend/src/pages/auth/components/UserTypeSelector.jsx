import { Box, Typography } from '@mui/material'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import DomainOutlinedIcon from '@mui/icons-material/DomainOutlined'

function UserTypeSelector({ userType, onChange }) {
  const isIndividual = userType === 'individual'
  const isInstitutional = userType === 'institutional'

  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', my: 2.5 }}>
      {/* Individual User Pill */}
      <Box
        onClick={() => onChange('individual')}
        role="button"
        tabIndex={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.2,
          px: 2.5,
          py: 1.2,
          borderRadius: '30px',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          border: isIndividual ? '2px solid #1b5e20' : '1.5px solid #d1d5db',
          backgroundColor: isIndividual ? '#f0f8f1' : '#ffffff',
          '&:hover': {
            borderColor: '#2e7d32',
            backgroundColor: isIndividual ? '#f0f8f1' : '#f9fafb',
          },
        }}
      >
        {/* Custom Radio Circle */}
        <Box
          sx={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            border: isIndividual ? '2px solid #1b5e20' : '2px solid #9e9e9e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isIndividual && (
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: '#1b5e20',
              }}
            />
          )}
        </Box>

        <PersonOutlineOutlinedIcon
          sx={{
            fontSize: 20,
            color: isIndividual ? '#1b5e20' : '#4b5563',
          }}
        />

        <Typography
          sx={{
            fontSize: '0.95rem',
            fontWeight: 600,
            color: isIndividual ? '#111827' : '#4b5563',
            userSelect: 'none',
          }}
        >
          Individual User
        </Typography>
      </Box>

      {/* Institutional User Pill */}
      <Box
        onClick={() => onChange('institutional')}
        role="button"
        tabIndex={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.2,
          px: 2.5,
          py: 1.2,
          borderRadius: '30px',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          border: isInstitutional ? '2px solid #1b5e20' : '1.5px solid #d1d5db',
          backgroundColor: isInstitutional ? '#f0f8f1' : '#ffffff',
          '&:hover': {
            borderColor: '#2e7d32',
            backgroundColor: isInstitutional ? '#f0f8f1' : '#f9fafb',
          },
        }}
      >
        {/* Custom Radio Circle */}
        <Box
          sx={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            border: isInstitutional ? '2px solid #1b5e20' : '2px solid #9e9e9e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isInstitutional && (
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: '#1b5e20',
              }}
            />
          )}
        </Box>

        <DomainOutlinedIcon
          sx={{
            fontSize: 20,
            color: isInstitutional ? '#1b5e20' : '#4b5563',
          }}
        />

        <Typography
          sx={{
            fontSize: '0.95rem',
            fontWeight: 600,
            color: isInstitutional ? '#111827' : '#4b5563',
            userSelect: 'none',
          }}
        >
          Institutional User
        </Typography>
      </Box>
    </Box>
  )
}

export default UserTypeSelector
