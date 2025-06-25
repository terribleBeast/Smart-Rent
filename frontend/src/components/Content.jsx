import React, { useEffect, useState } from 'react';
import {
  Grid,
  Button,
  Typography,
  Paper,
  Container,
  CardHeader,
  CardContent,
  CardActions,
  Box
} from "@mui/material";
import { ContractAgreement, managerContract, users } from '../features/entities';
import { useSelector } from 'react-redux';
import { selectUser } from '../userSlice';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import { createAgreement } from '../features/contract';

const Content = () => {

  const user = useSelector(selectUser)
  // const [currButton, setCurrButton] = useState(buttons.startRent)


  const buttons = {

    startRent: (property) => (<Button
      variant="contained"
      color="primary"
      onClick={() => handleRent(property.id)}
    >
      Начать аренду
    </Button>),

    canselRent: (property) => (
      <Button
        variant="outlined"
        color="error"
        onClick={() => handleCancel(property.id)}
      >
        Отменить аренду
      </Button>
    ),
    actionUser: (property) => (
      <Button
        variant="outlined"
        color="success"
        onClick={() => handleActivate(property.id)}
      >

        Получить деньги

      </Button>)
  }

  const [properties, setProperties] = React.useState([
    {
      id: 1,
      status: 'Available', // 'Available', 'Rented', 'Cancelled'
      metadata: 'ул. Примерная, 123',
      pricePerDay: 5,
      landlord: users[0].name,
      tenant: null,
      startRent: null,
      endEnd: null
    },
    {
      id: 2,
      status: 'Rented',
      metadata: 'ул. Тестовая, 456',
      pricePerDay: 7,
      landlord: users[1].name,
      tenant: null, 
      startRent: null,
      endEnd: null
    }
  ]);


  function changeButton(property) {


    switch (property.status) {
      case "Available":
        return buttons.startRent(property);
      case "Rented":
        return buttons.canselRent(property)
      case "Cancelled":
        return buttons.actionUser(property)
    }
  }



  const handleRent = (id) => {

    createAgreement(new ContractAgreement(
      
    ))
    
    setProperties(properties.map(property =>
      property.id === id && property.landlord !== user.name ? { ...property, status: 'Rented', tenant: user.name } : property
    ));


  };

  const handleCancel = (id) => {
    setProperties(properties.map(property =>
      property.id === id ? { ...property, status: 'Cancelled', tenant: null } : property
    ));
  };

  const handleActivate = (id) => {
    setProperties(properties.map(property =>
      property.id === id ? { ...property, status: 'Available' } : property
    ));
  };

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Управление арендой жилья
        </Typography>

        <Grid container spacing={3}>
          {properties.map((property) => (
            <Grid item xs={12} sm={6} key={property.id}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <CardHeader
                  title={`Жилье #${property.id}`}
                  subheader={property.metadata}
                />
                <CardContent>
                  <Typography variant="body1">
                    Статус: {property.status === 'Available' ? 'Доступно' :
                      property.status === 'Rented' ? 'Арендовано' : 'Отменено'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Цена: {property.pricePerDay} ETH/день
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Владелец: {property.landlord}
                  </Typography>
                  {property.tenant ?
                    <Typography variant="body2" color="text.secondary">
                      Арендатор: {property.tenant}
                    </Typography> :
                    null}
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end' }}>

                  {
                    changeButton(property)
                  }
                </CardActions>
              </Paper>
            </Grid>

          ))}
          <Grid item xs={12} sm={6} style={{ display: "flex", textAlign: 'center' }}>
            <Button>
              <ControlPointIcon fontSize='large' />
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Content;